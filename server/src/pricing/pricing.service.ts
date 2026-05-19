import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PricingPackage } from './pricing-package.entity';
import { Photographer } from '../photographers/photographer.entity';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(PricingPackage) private repo: Repository<PricingPackage>,
    @InjectRepository(Photographer) private phRepo: Repository<Photographer>,
  ) {}

  async getByPhotographer(slug: string) {
    const ph = await this.phRepo.findOne({ where: { slug } });
    if (!ph) throw new NotFoundException();
    return this.repo.find({ where: { photographerId: ph.id }, order: { displayOrder: 'ASC' } });
  }

  async create(slug: string, data: Partial<PricingPackage>) {
    const ph = await this.phRepo.findOne({ where: { slug } });
    if (!ph) throw new NotFoundException();
    const count = await this.repo.count({ where: { photographerId: ph.id } });
    const pkg = this.repo.create({ ...data, photographerId: ph.id, displayOrder: count });
    return this.repo.save(pkg);
  }

  async update(id: number, data: Partial<PricingPackage>) {
    const allowed: (keyof PricingPackage)[] = ['name', 'description', 'price', 'currency', 'features', 'duration', 'maxPhotos', 'highlighted', 'coverImages', 'displayOrder'];
    const update: Partial<PricingPackage> = {};
    for (const key of allowed) {
      if (key in data) (update as any)[key] = (data as any)[key];
    }
    await this.repo.update(id, update);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }

  async getByUserId(userId: string) {
    const ph = await this.phRepo.findOne({ where: { userId } });
    if (!ph) return [];
    return this.repo.find({ where: { photographerId: ph.id }, order: { displayOrder: 'ASC' } });
  }
}
