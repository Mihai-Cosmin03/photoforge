import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { Photographer } from '../photographers/photographer.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private repo: Repository<Review>,
    @InjectRepository(Photographer) private phRepo: Repository<Photographer>,
  ) {}

  async getByPhotographer(slug: string) {
    const ph = await this.phRepo.findOne({ where: { slug } });
    if (!ph) throw new NotFoundException();
    const reviews = await this.repo.find({
      where: { photographerId: ph.id },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    const avg = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;
    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        text: r.text,
        createdAt: r.createdAt,
        userName: r.user?.name ?? 'Anonymous',
      })),
      avgRating: avg ? Math.round(avg * 10) / 10 : null,
      total: reviews.length,
    };
  }

  async findAll({ page = 1, limit = 50 }: { page?: number; limit?: number } = {}) {
    const [data, total] = await this.repo.findAndCount({
      relations: ['user', 'photographer'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async deleteById(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }

  async create(slug: string, userId: string, rating: number, text: string) {
    const ph = await this.phRepo.findOne({ where: { slug } });
    if (!ph) throw new NotFoundException();
    // One review per user per photographer
    const existing = await this.repo.findOne({ where: { photographerId: ph.id, userId } });
    if (existing) {
      await this.repo.update(existing.id, { rating, text });
      return this.repo.findOne({ where: { id: existing.id }, relations: ['user'] });
    }
    const review = this.repo.create({ photographerId: ph.id, userId, rating, text });
    return this.repo.save(review);
  }
}
