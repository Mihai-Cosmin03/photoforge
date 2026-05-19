import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Availability } from './availability.entity';
import { Photographer } from '../photographers/photographer.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability) private repo: Repository<Availability>,
    @InjectRepository(Photographer) private phRepo: Repository<Photographer>,
  ) {}

  async getByPhotographer(slug: string, year: number, month: number) {
    const ph = await this.phRepo.findOne({ where: { slug } });
    if (!ph) throw new NotFoundException();
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return this.repo.find({
      where: { photographerId: ph.id, date: Between(start, end) },
      order: { date: 'ASC' },
    });
  }

  async toggle(userId: string, date: string, available: boolean) {
    const ph = await this.phRepo.findOne({ where: { userId } });
    if (!ph) throw new NotFoundException('Photographer profile not found');
    const existing = await this.repo.findOne({ where: { photographerId: ph.id, date } });
    if (existing) {
      await this.repo.update(existing.id, { available });
      return { ...existing, available };
    }
    const entry = this.repo.create({ photographerId: ph.id, date, available });
    return this.repo.save(entry);
  }
}
