import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio, PortfolioStatus } from './portfolio.entity';
import { PortfolioImage } from './portfolio-image.entity';
import { Category } from '../categories/category.entity';
import { Photographer } from '../photographers/photographer.entity';

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(Portfolio)
    private repo: Repository<Portfolio>,
    @InjectRepository(PortfolioImage)
    private imageRepo: Repository<PortfolioImage>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Photographer)
    private photographerRepo: Repository<Photographer>,
  ) {}

  async findAll(filters: { categorySlug?: string; photographerSlug?: string; page?: number; limit?: number } = {}) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 12;

    let query = this.repo
      .createQueryBuilder('portfolio')
      .leftJoinAndSelect('portfolio.images', 'image')
      .leftJoinAndSelect('portfolio.photographer', 'photographer')
      .leftJoinAndSelect('portfolio.category', 'category')
      .where("portfolio.status = 'approved'")
      .orderBy('portfolio.featured', 'DESC')
      .addOrderBy('portfolio.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.categorySlug) {
      query = query.andWhere('category.slug = :categorySlug', { categorySlug: filters.categorySlug });
    }
    if (filters.photographerSlug) {
      query = query.andWhere('photographer.slug = :photographerSlug', {
        photographerSlug: filters.photographerSlug,
      });
    }

    const [portfolios, total] = await query.getManyAndCount();
    return {
      data: this.sortAndShape(portfolios),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string) {
    return this.repo.findOne({
      where: { slug },
      relations: ['images', 'photographer', 'category'],
    });
  }

  async findBySlugOrFail(slug: string) {
    const p = await this.findBySlug(slug);
    if (!p) throw new NotFoundException(`Portfolio '${slug}' not found`);
    return this.shape(p);
  }

  async countByCategory(categorySlug: string) {
    return this.repo
      .createQueryBuilder('portfolio')
      .leftJoin('portfolio.category', 'category')
      .where('category.slug = :categorySlug', { categorySlug })
      .andWhere("portfolio.status = 'approved'")
      .getCount();
  }

  async create(data: {
    slug: string;
    title: string;
    description: string;
    categorySlug: string;
    photographerSlug: string;
    coverImage?: string;
    featured?: boolean;
    materialsEnabled?: boolean;
    imageUrls?: string[];
  }) {
    const category = await this.categoryRepo.findOne({ where: { slug: data.categorySlug } });
    if (!category) throw new NotFoundException('Category not found');

    const photographer = await this.photographerRepo.findOne({ where: { slug: data.photographerSlug } });
    if (!photographer) throw new NotFoundException('Photographer not found');

    const portfolio = this.repo.create({
      slug: data.slug,
      title: data.title,
      description: data.description,
      categoryId: category.id,
      photographerId: photographer.id,
      coverImage: data.coverImage,
      featured: data.featured ?? false,
      materialsEnabled: data.materialsEnabled ?? false,
      status: 'pending',
    });

    const saved = await this.repo.save(portfolio);

    if (data.imageUrls?.length) {
      const images = data.imageUrls.map((url, i) =>
        this.imageRepo.create({ portfolioId: saved.id, imageUrl: url, displayOrder: i }),
      );
      await this.imageRepo.save(images);
    }

    return this.findBySlug(saved.slug);
  }

  async addImage(portfolioId: number, imageUrl: string, order?: number) {
    const count = await this.imageRepo.count({ where: { portfolioId } });
    const image = this.imageRepo.create({
      portfolioId,
      imageUrl,
      displayOrder: order ?? count,
    });
    return this.imageRepo.save(image);
  }

  async addImageBySlug(slug: string, imageUrl: string) {
    const portfolio = await this.findBySlug(slug);
    if (!portfolio) throw new NotFoundException(`Portfolio '${slug}' not found`);
    const image = await this.addImage(portfolio.id, imageUrl);
    // Auto-set cover image if none exists
    if (!portfolio.coverImage) {
      await this.repo.update(portfolio.id, { coverImage: imageUrl });
    }
    return image;
  }

  async findByUserId(userId: string) {
    const photographer = await this.photographerRepo.findOne({ where: { userId } });
    if (!photographer) return [];
    return this.repo.find({
      where: { photographerId: photographer.id },
      relations: ['images', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  async userOwnsPortfolio(portfolioId: number, userId: string): Promise<boolean> {
    const photographer = await this.photographerRepo.findOne({ where: { userId } });
    if (!photographer) return false;
    const portfolio = await this.repo.findOne({ where: { id: portfolioId } });
    return portfolio?.photographerId === photographer.id;
  }

  async userOwnsImage(imageId: number, userId: string): Promise<boolean> {
    const image = await this.imageRepo.findOne({ where: { id: imageId } });
    if (!image) return false;
    return this.userOwnsPortfolio(image.portfolioId, userId);
  }

  async deleteImage(imageId: number) {
    await this.imageRepo.delete(imageId);
  }

  async reorderImages(slug: string, orderedIds: number[]) {
    const portfolio = await this.findBySlug(slug);
    if (!portfolio) throw new NotFoundException(`Portfolio '${slug}' not found`);
    await Promise.all(
      orderedIds.map((id, index) =>
        this.imageRepo.update(id, { displayOrder: index }),
      ),
    );
    return this.findBySlugOrFail(slug);
  }

  async setCoverImage(slug: string, imageUrl: string) {
    const p = await this.findBySlug(slug);
    if (!p) throw new NotFoundException(`Portfolio '${slug}' not found`);
    await this.repo.update(p.id, { coverImage: imageUrl });
    return this.findBySlugOrFail(slug);
  }

  async toggleMaterialsEnabled(slug: string, value: boolean) {
    const p = await this.findBySlug(slug);
    if (!p) throw new NotFoundException(`Portfolio '${slug}' not found`);
    await this.repo.update(p.id, { materialsEnabled: value });
    return this.findBySlugOrFail(slug);
  }

  async updateStatus(id: number, status: PortfolioStatus) {
    await this.repo.update(id, { status });
    return this.repo.findOne({ where: { id }, relations: ['images', 'photographer', 'category'] });
  }

  async findPending() {
    return this.repo.find({
      where: { status: 'pending' },
      relations: ['photographer', 'category'],
    });
  }

  shape(p: Portfolio) {
    const sortedImages = (p.images || [])
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((img) => img.imageUrl);
    return {
      ...p,
      coverImage: p.coverImage || sortedImages[0] || null,
      images: sortedImages,
    };
  }

  private sortAndShape(portfolios: Portfolio[]) {
    return portfolios
      .sort((a, b) => Number(b.featured) - Number(a.featured))
      .map((p) => this.shape(p));
  }
}
