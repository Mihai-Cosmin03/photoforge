import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

const DEFAULT_CATEGORIES = [
  { slug: 'wedding',   name: 'Wedding',    description: 'Elegant wedding sessions and candid moments.',              featured: true  },
  { slug: 'portraits', name: 'Portraits',  description: 'Studio portraits and creative lighting.',                   featured: true  },
  { slug: 'fashion',   name: 'Fashion',    description: 'Editorial shoots, runway and creative styling.',            featured: true  },
  { slug: 'concerts',  name: 'Concerts',   description: 'Live energy, stage emotion and crowd atmosphere.',          featured: false },
  { slug: 'events',    name: 'Events',     description: 'Corporate events, private parties and conferences.',        featured: false },
  { slug: 'commercial',name: 'Commercial', description: 'Product photography and brand campaigns.',                  featured: false },
  { slug: 'travel',    name: 'Travel',     description: 'Landscape, nature and destination photography.',            featured: false },
  { slug: 'lifestyle', name: 'Lifestyle',  description: 'Natural moments, everyday stories and candid life.',        featured: false },
];

@Injectable()
export class CategoriesService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Category)
    private repo: Repository<Category>,
  ) {}

  async onApplicationBootstrap() {
    for (const cat of DEFAULT_CATEGORIES) {
      const exists = await this.repo.findOne({ where: { slug: cat.slug } });
      if (!exists) {
        await this.repo.save(this.repo.create(cat));
        console.log(`[Seed] Created category: ${cat.slug}`);
      }
    }
  }

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
