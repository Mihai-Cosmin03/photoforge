import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User, UserRole } from './user.entity';
import { Photographer } from '../photographers/photographer.entity';
import { Portfolio } from '../portfolios/portfolio.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  create(data: { name: string; email: string; passwordHash: string }) {
    const user = this.repo.create({ ...data, role: 'user' });
    return this.repo.save(user);
  }

  async updateName(id: string, name: string) {
    await this.repo.update(id, { name });
    return this.findById(id);
  }

  async updateProfile(id: string, data: { name?: string; bio?: string; avatar?: string | null; avatarIndex?: number | null }) {
    const filtered: any = {}
    if (data.name        !== undefined) filtered.name        = data.name
    if (data.bio         !== undefined) filtered.bio         = data.bio
    if (data.avatar      !== undefined) filtered.avatar      = data.avatar
    if (data.avatarIndex !== undefined) filtered.avatarIndex = data.avatarIndex
    if (Object.keys(filtered).length) await this.repo.update(id, filtered)
    return this.findById(id)
  }

  async getProfile(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: [
        'savedPhotographers',
        'savedPortfolios',
      ],
    });
  }

  async savePhotographer(userId: string, photographer: Photographer) {
    const user = await this.repo.findOne({
      where: { id: userId },
      relations: ['savedPhotographers'],
    });
    if (!user) throw new NotFoundException('User not found');
    const already = user.savedPhotographers.some((p) => p.id === photographer.id);
    if (!already) {
      user.savedPhotographers.push(photographer);
      await this.repo.save(user);
    }
  }

  async unsavePhotographer(userId: string, photographerId: number) {
    const user = await this.repo.findOne({
      where: { id: userId },
      relations: ['savedPhotographers'],
    });
    if (!user) throw new NotFoundException('User not found');
    user.savedPhotographers = user.savedPhotographers.filter((p) => p.id !== photographerId);
    await this.repo.save(user);
  }

  async savePortfolio(userId: string, portfolio: Portfolio) {
    const user = await this.repo.findOne({
      where: { id: userId },
      relations: ['savedPortfolios'],
    });
    if (!user) throw new NotFoundException('User not found');
    const already = user.savedPortfolios.some((p) => p.id === portfolio.id);
    if (!already) {
      user.savedPortfolios.push(portfolio);
      await this.repo.save(user);
    }
  }

  async unsavePortfolio(userId: string, portfolioId: number) {
    const user = await this.repo.findOne({
      where: { id: userId },
      relations: ['savedPortfolios'],
    });
    if (!user) throw new NotFoundException('User not found');
    user.savedPortfolios = user.savedPortfolios.filter((p) => p.id !== portfolioId);
    await this.repo.save(user);
  }

  // ── Admin operations ────────────────────────────────────────────────

  async findAll(): Promise<Omit<User, 'passwordHash' | 'resetPasswordToken' | 'resetPasswordExpires'>[]> {
    const users = await this.repo.find({ order: { createdAt: 'DESC' } });
    return users.map(({ passwordHash, resetPasswordToken, resetPasswordExpires, ...safe }) => safe as any);
  }

  async updateRole(id: string, role: UserRole, requesterId: string) {
    if (id === requesterId) throw new ForbiddenException('Cannot change your own role');
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.repo.update(id, { role });
    return { ...user, role };
  }

  async setResetToken(email: string, token: string, expires: Date) {
    const user = await this.repo.findOne({ where: { email } });
    if (!user) return null; // Don't reveal if email exists
    await this.repo.update(user.id, { resetPasswordToken: token, resetPasswordExpires: expires });
    return user;
  }

  async findByResetToken(token: string) {
    return this.repo.findOne({
      where: { resetPasswordToken: token },
    });
  }

  async resetPassword(userId: string, passwordHash: string) {
    await this.repo.update(userId, {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }

  async getGlobalStats() {
    const [totals, byRole, usersByMonth, bookingsByStatus, portfoliosByStatus, reviewCount] =
      await Promise.all([
        this.dataSource.query(`
          SELECT
            (SELECT COUNT(*) FROM users) AS total_users,
            (SELECT COUNT(*) FROM photographers WHERE status = 'approved') AS total_photographers,
            (SELECT COUNT(*) FROM portfolios WHERE status = 'approved') AS total_portfolios,
            (SELECT COUNT(*) FROM bookings) AS total_bookings
        `),
        this.dataSource.query(
          `SELECT role, COUNT(*) as count FROM users GROUP BY role`
        ),
        this.dataSource.query(`
          SELECT TO_CHAR(created_at, 'Mon YY') as month,
                 DATE_TRUNC('month', created_at) as sort_key,
                 COUNT(*) as count
          FROM users
          WHERE created_at >= NOW() - INTERVAL '6 months'
          GROUP BY month, sort_key
          ORDER BY sort_key
        `),
        this.dataSource.query(
          `SELECT status, COUNT(*) as count FROM bookings GROUP BY status`
        ),
        this.dataSource.query(
          `SELECT status, COUNT(*) as count FROM portfolios GROUP BY status`
        ),
        this.dataSource.query(`SELECT COUNT(*) as count FROM reviews`),
      ]);

    return {
      totals: {
        users: parseInt(totals[0]?.total_users ?? '0', 10),
        photographers: parseInt(totals[0]?.total_photographers ?? '0', 10),
        portfolios: parseInt(totals[0]?.total_portfolios ?? '0', 10),
        bookings: parseInt(totals[0]?.total_bookings ?? '0', 10),
        reviews: parseInt(reviewCount[0]?.count ?? '0', 10),
      },
      usersByRole: byRole.reduce((acc: Record<string, number>, r: any) => {
        acc[r.role] = parseInt(r.count, 10); return acc;
      }, {}),
      usersByMonth: usersByMonth as { month: string; count: string }[],
      bookingsByStatus: bookingsByStatus.reduce((acc: Record<string, number>, r: any) => {
        acc[r.status] = parseInt(r.count, 10); return acc;
      }, {}),
      portfoliosByStatus: portfoliosByStatus.reduce((acc: Record<string, number>, r: any) => {
        acc[r.status] = parseInt(r.count, 10); return acc;
      }, {}),
    };
  }

  async deleteUser(id: string, requesterId: string) {
    if (id === requesterId) throw new ForbiddenException('Cannot delete your own account');
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.repo.delete(id);
    return { deleted: true };
  }
}
