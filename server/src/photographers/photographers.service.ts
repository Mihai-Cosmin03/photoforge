import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Photographer } from './photographer.entity';

@Injectable()
export class PhotographersService {
  constructor(
    @InjectRepository(Photographer)
    private repo: Repository<Photographer>,
    private dataSource: DataSource,
  ) {}

  async findAll(filters: { city?: string; specialty?: string; page?: number; limit?: number } = {}) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 12;

    let query = this.repo
      .createQueryBuilder('photographer')
      .where("photographer.status = 'approved'")
      .orderBy('photographer.featured', 'DESC')
      .addOrderBy('photographer.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.city) {
      query = query.andWhere('LOWER(photographer.city) = LOWER(:city)', { city: filters.city });
    }
    if (filters.specialty) {
      query = query.andWhere(':specialty = ANY(string_to_array(photographer.specialties, \',\'))', {
        specialty: filters.specialty,
      });
    }

    const [data, total] = await query.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByUserId(userId: string) {
    return this.repo.findOne({ where: { userId } });
  }

  async updateByUserId(userId: string, data: Partial<Photographer>) {
    const ph = await this.repo.findOne({ where: { userId } });
    if (!ph) return null;
    const allowed = ['bio', 'city', 'experience', 'avatar', 'specialties'];
    const update: Partial<Photographer> = {};
    for (const key of allowed) {
      if (key in data) (update as any)[key] = (data as any)[key];
    }
    await this.repo.update(ph.id, update);
    return this.repo.findOne({ where: { id: ph.id } });
  }

  async findPending() {
    return this.repo.find({ where: { status: 'pending' } });
  }

  async findBySlug(slug: string) {
    return this.repo.findOne({ where: { slug } });
  }

  async findBySlugOrFail(slug: string) {
    const p = await this.findBySlug(slug);
    if (!p) throw new NotFoundException(`Photographer '${slug}' not found`);
    return p;
  }

  async create(data: Partial<Photographer>) {
    const photographer = this.repo.create(data);
    return this.repo.save(photographer);
  }

  async update(slug: string, data: Partial<Photographer>) {
    const p = await this.findBySlugOrFail(slug);
    await this.repo.update(p.id, data);
    return this.findBySlug(slug);
  }

  async upsertBySlug(data: Partial<Photographer>) {
    const existing = await this.repo.findOne({ where: { slug: data.slug } });
    if (existing) {
      await this.repo.update(existing.id, data);
      return this.repo.findOne({ where: { slug: data.slug } });
    }
    const photographer = this.repo.create(data);
    return this.repo.save(photographer);
  }

  async updateStatus(id: number, status: 'approved' | 'pending') {
    await this.repo.update(id, { status });
    return this.repo.findOne({ where: { id } });
  }

  async incrementViews(slug: string) {
    await this.repo
      .createQueryBuilder()
      .update()
      .set({ views: () => 'views + 1' })
      .where('slug = :slug', { slug })
      .execute();
  }

  async getStats(slug: string) {
    const photographer = await this.findBySlugOrFail(slug);

    const savesResult = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM saved_photographers WHERE photographer_id = $1`,
      [photographer.id],
    );
    const portfolioCount = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM portfolios WHERE photographer_id = $1 AND status = 'approved'`,
      [photographer.id],
    );

    return {
      views: photographer.views,
      saves: parseInt(savesResult[0]?.count ?? '0', 10),
      portfolios: parseInt(portfolioCount[0]?.count ?? '0', 10),
    };
  }

  async getDashboard(userId: string) {
    const ph = await this.repo.findOne({ where: { userId } });
    if (!ph) return null;

    const [savesResult, portfoliosAll, bookings, reviews, registrations] = await Promise.all([
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM saved_photographers WHERE photographer_id = $1`,
        [ph.id],
      ),
      this.dataSource.query(
        `SELECT status, COUNT(*) as count FROM portfolios WHERE photographer_id = $1 GROUP BY status`,
        [ph.id],
      ),
      this.dataSource.query(
        `SELECT status, COUNT(*) as count FROM bookings WHERE photographer_id = $1 GROUP BY status`,
        [ph.id],
      ),
      this.dataSource.query(
        `SELECT AVG(rating)::numeric(3,1) as avg, COUNT(*) as total FROM reviews WHERE photographer_id = $1`,
        [ph.id],
      ),
      // New user registrations per month (last 6 months) — used for chart
      this.dataSource.query(
        `SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(*) as count
         FROM bookings WHERE photographer_id = $1
         AND created_at >= NOW() - INTERVAL '6 months'
         GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
         ORDER BY DATE_TRUNC('month', created_at)`,
        [ph.id],
      ),
    ]);

    const portfolioStats = { approved: 0, pending: 0 };
    for (const row of portfoliosAll) {
      if (row.status === 'approved') portfolioStats.approved = parseInt(row.count, 10);
      if (row.status === 'pending') portfolioStats.pending = parseInt(row.count, 10);
    }

    const bookingStats = { pending: 0, accepted: 0, rejected: 0 };
    for (const row of bookings) {
      if (row.status in bookingStats) bookingStats[row.status as keyof typeof bookingStats] = parseInt(row.count, 10);
    }

    const completeness = this.getProfileCompleteness(ph);

    return {
      photographer: { id: ph.id, name: ph.name, slug: ph.slug, avatar: ph.avatar, status: ph.status },
      views: ph.views,
      saves: parseInt(savesResult[0]?.count ?? '0', 10),
      portfolios: portfolioStats,
      bookings: bookingStats,
      rating: {
        avg: parseFloat(reviews[0]?.avg ?? '0'),
        total: parseInt(reviews[0]?.total ?? '0', 10),
      },
      bookingsByMonth: registrations as { month: string; count: string }[],
      completeness,
    };
  }

  getProfileCompleteness(ph: Photographer): { score: number; items: { label: string; done: boolean }[] } {
    const items = [
      { label: 'Profile photo (avatar)', done: !!ph.avatar },
      { label: 'Bio / description',      done: !!(ph.bio && ph.bio.trim().length > 30) },
      { label: 'City / location',        done: !!ph.city },
      { label: 'Years of experience',    done: ph.experience > 0 },
      { label: 'Specialties selected',   done: Array.isArray(ph.specialties) ? ph.specialties.length > 0 : !!(ph.specialties as any) },
      { label: 'Profile approved',       done: ph.status === 'approved' },
    ];
    const done = items.filter((i) => i.done).length;
    const score = Math.round((done / items.length) * 100);
    return { score, items };
  }
}
