import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private repo: Repository<Notification>) {}

  async getForUser(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 30,
    });
  }

  async getUnreadCount(userId: string) {
    return this.repo.count({ where: { userId, read: false } });
  }

  async markRead(id: string, userId: string) {
    await this.repo.update({ id, userId }, { read: true });
  }

  async markAllRead(userId: string) {
    await this.repo.update({ userId, read: false }, { read: true });
  }

  async create(userId: string, type: string, title: string, body?: string, link?: string) {
    const n = this.repo.create({ userId, type, title, body, link });
    return this.repo.save(n);
  }
}
