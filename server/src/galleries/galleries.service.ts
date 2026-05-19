import { Injectable, NotFoundException, ForbiddenException, GoneException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientGallery } from './gallery.entity';
import { Photographer } from '../photographers/photographer.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class GalleriesService {
  constructor(
    @InjectRepository(ClientGallery) private repo: Repository<ClientGallery>,
    @InjectRepository(Photographer) private phRepo: Repository<Photographer>,
  ) {}

  async getMine(userId: string) {
    const ph = await this.phRepo.findOne({ where: { userId } });
    if (!ph) return [];
    return this.repo.find({
      where: { photographerId: ph.id },
      order: { createdAt: 'DESC' },
    });
  }

  async create(userId: string, data: { title: string; description?: string; clientEmails?: string; expiresAt?: string }) {
    const ph = await this.phRepo.findOne({ where: { userId } });
    if (!ph) throw new ForbiddenException('No photographer profile found');

    const emails = data.clientEmails
      ? data.clientEmails.split(',').map(e => e.trim()).filter(Boolean)
      : [];

    const gallery = Object.assign(new ClientGallery(), {
      photographerId: ph.id,
      title: data.title,
      description: data.description ?? null,
      accessCode: randomUUID(),
      images: null,
      clientEmails: emails.length > 0 ? emails : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    });
    return this.repo.save(gallery);
  }

  async addImages(id: string, userId: string, urls: string[]) {
    const ph = await this.phRepo.findOne({ where: { userId } });
    if (!ph) throw new ForbiddenException();
    const gallery = await this.repo.findOne({ where: { id } });
    if (!gallery) throw new NotFoundException();
    if (gallery.photographerId !== ph.id) throw new ForbiddenException();

    const existing = Array.isArray(gallery.images) ? gallery.images.filter(Boolean) : [];
    const merged = [...existing, ...urls].filter(Boolean);
    await this.repo.update(id, { images: merged });
    return this.repo.findOne({ where: { id } });
  }

  async removeImage(id: string, userId: string, url: string) {
    const ph = await this.phRepo.findOne({ where: { userId } });
    if (!ph) throw new ForbiddenException();
    const gallery = await this.repo.findOne({ where: { id } });
    if (!gallery) throw new NotFoundException();
    if (gallery.photographerId !== ph.id) throw new ForbiddenException();

    const images = (Array.isArray(gallery.images) ? gallery.images : []).filter(u => u !== url && u);
    await this.repo.update(id, { images });
    return this.repo.findOne({ where: { id } });
  }

  async getByCode(code: string, viewerEmail?: string) {
    const gallery = await this.repo.findOne({
      where: { accessCode: code },
      relations: ['photographer'],
    });
    if (!gallery) throw new NotFoundException('Gallery not found');

    if (gallery.expiresAt && new Date() > new Date(gallery.expiresAt)) {
      throw new GoneException('This gallery has expired');
    }

    const emails = Array.isArray(gallery.clientEmails) ? gallery.clientEmails.filter(Boolean) : [];
    if (emails.length > 0) {
      if (!viewerEmail || !emails.includes(viewerEmail.toLowerCase())) {
        throw new ForbiddenException('You do not have access to this gallery');
      }
    }

    return gallery;
  }

  async update(id: string, userId: string, data: Partial<{ title: string; description: string; clientEmails: string; expiresAt: string }>) {
    const ph = await this.phRepo.findOne({ where: { userId } });
    if (!ph) throw new ForbiddenException();
    const gallery = await this.repo.findOne({ where: { id } });
    if (!gallery) throw new NotFoundException();
    if (gallery.photographerId !== ph.id) throw new ForbiddenException();

    const update: any = {};
    if (data.title !== undefined) update.title = data.title;
    if (data.description !== undefined) update.description = data.description;
    if (data.clientEmails !== undefined) {
      const parsed = data.clientEmails.split(',').map(e => e.trim()).filter(Boolean);
      update.clientEmails = parsed.length > 0 ? parsed : null;
    }
    if (data.expiresAt !== undefined) update.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    await this.repo.update(id, update);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: string, userId: string) {
    const ph = await this.phRepo.findOne({ where: { userId } });
    if (!ph) throw new ForbiddenException();
    const gallery = await this.repo.findOne({ where: { id } });
    if (!gallery) throw new NotFoundException();
    if (gallery.photographerId !== ph.id) throw new ForbiddenException();
    await this.repo.delete(id);
  }
}
