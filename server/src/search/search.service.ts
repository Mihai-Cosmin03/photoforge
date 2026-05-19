import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photographer } from '../photographers/photographer.entity';
import { Portfolio } from '../portfolios/portfolio.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Photographer)
    private photographerRepo: Repository<Photographer>,
    @InjectRepository(Portfolio)
    private portfolioRepo: Repository<Portfolio>,
  ) {}

  async search(q: string, filters?: {
    city?: string;
    specialty?: string;
    sortBy?: 'relevance' | 'experience_asc' | 'experience_desc';
    type?: 'all' | 'photographers' | 'portfolios';
  }) {
    const like = `%${q}%`;
    const type = filters?.type || 'all';

    const phQuery = this.photographerRepo
      .createQueryBuilder('ph')
      .where("ph.status = 'approved'")
      .andWhere(
        '(ph.name ILIKE :like OR ph.city ILIKE :like OR ph.bio ILIKE :like OR ph.specialties ILIKE :like)',
        { like },
      );

    if (filters?.city) {
      phQuery.andWhere('ph.city ILIKE :city', { city: `%${filters.city}%` });
    }
    if (filters?.specialty) {
      phQuery.andWhere('ph.specialties ILIKE :spec', { spec: `%${filters.specialty}%` });
    }

    if (filters?.sortBy === 'experience_asc') phQuery.orderBy('ph.experience', 'ASC');
    else if (filters?.sortBy === 'experience_desc') phQuery.orderBy('ph.experience', 'DESC');
    else phQuery.orderBy('ph.featured', 'DESC');

    phQuery.take(20);

    const pQuery = this.portfolioRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.photographer', 'photographer')
      .leftJoinAndSelect('p.category', 'category')
      .where("p.status = 'approved'")
      .andWhere(
        '(p.title ILIKE :like OR p.description ILIKE :like OR category.name ILIKE :like OR photographer.name ILIKE :like)',
        { like },
      )
      .take(20);

    const [photographersRaw, portfoliosRaw] = await Promise.all([
      type !== 'portfolios' ? phQuery.getMany() : Promise.resolve([]),
      type !== 'photographers' ? pQuery.getMany() : Promise.resolve([]),
    ]);

    return {
      photographers: photographersRaw.map((ph) => ({
        id: ph.id,
        slug: ph.slug,
        name: ph.name,
        city: ph.city,
        avatar: ph.avatar,
        experience: ph.experience,
        specialties: ph.specialties,
        featured: ph.featured,
      })),
      portfolios: portfoliosRaw.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        coverImage: p.coverImage,
        photographerName: p.photographer?.name,
        photographerSlug: p.photographer?.slug,
        categoryName: p.category?.name,
        categorySlug: p.category?.slug,
      })),
    };
  }
}
