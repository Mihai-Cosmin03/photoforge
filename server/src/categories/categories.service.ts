import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private repo: Repository<Category>,
  ) {}

  async findAll() {
    const categories = await this.repo.find();
    return categories.sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  async findBySlug(slug: string) {
    const category = await this.repo.findOne({ where: { slug } });
    if (!category) throw new NotFoundException(`Category '${slug}' not found`);
    return category;
  }

  async findBySlugWithPortfolioCount(slug: string) {
    const result = await this.repo
      .createQueryBuilder('category')
      .leftJoin('category.portfolios', 'portfolio', "portfolio.status = 'approved'")
      .addSelect('COUNT(portfolio.id)', 'portfolioCount')
      .where('category.slug = :slug', { slug })
      .groupBy('category.id')
      .getRawAndEntities();

    if (!result.entities[0]) throw new NotFoundException(`Category '${slug}' not found`);

    return {
      ...result.entities[0],
      portfolioCount: parseInt(result.raw[0]?.portfolioCount ?? '0', 10),
    };
  }

  async create(data: Partial<Category>) {
    const category = this.repo.create(data);
    return this.repo.save(category);
  }

  async updateById(id: number, data: Partial<Category>) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  async upsertBySlug(data: Partial<Category>) {
    const existing = await this.repo.findOne({ where: { slug: data.slug } });
    if (existing) {
      await this.repo.update(existing.id, data);
      return this.repo.findOne({ where: { slug: data.slug } });
    }
    const category = this.repo.create(data);
    return this.repo.save(category);
  }
}
