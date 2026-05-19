import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './booking.entity';
import { Photographer } from '../photographers/photographer.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking) private repo: Repository<Booking>,
    @InjectRepository(Photographer) private phRepo: Repository<Photographer>,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
  ) {}

  async createBooking(userId: string, photographerSlug: string, data: Partial<Booking>) {
    const ph = await this.phRepo.findOne({ where: { slug: photographerSlug }, relations: ['user'] });
    if (!ph) throw new NotFoundException('Photographer not found');
    const booking = this.repo.create({ ...data, userId, photographerId: ph.id });
    const saved = await this.repo.save(booking);

    // Notify photographer of new booking request (in-app + email)
    if (ph.userId) {
      const date = (data as any).date || 'a date TBD';
      const isConsultation = (data as any).type === 'consultation';
      await this.notificationsService.create(
        ph.userId,
        'booking_request',
        isConsultation ? 'New intro call request' : 'New booking request',
        isConsultation
          ? `Someone wants to schedule an intro call with you.`
          : `You have a new session request for ${date}.`,
        '/profile',
      );
      if (ph.user?.email) {
        this.emailService.sendBookingRequest(ph.user.email, ph.name, date).catch(() => null);
      }
    }

    return saved;
  }

  async getMyBookings(userId: string) {
    return this.repo.find({
      where: { userId },
      relations: ['photographer'],
      order: { createdAt: 'DESC' },
    });
  }

  async getIncomingRequests(userId: string) {
    const ph = await this.phRepo.findOne({ where: { userId } });
    if (!ph) return [];
    return this.repo.find({
      where: { photographerId: ph.id },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async isPhotographerOfBooking(bookingId: string, userId: string): Promise<boolean> {
    const ph = await this.phRepo.findOne({ where: { userId } });
    if (!ph) return false;
    const booking = await this.repo.findOne({ where: { id: bookingId } });
    return booking?.photographerId === ph.id;
  }

  async updateStatus(id: string, status: BookingStatus, note?: string) {
    await this.repo.update(id, { status, ...(note !== undefined ? { photographerNote: note } : {}) });
    const booking = await this.repo.findOne({ where: { id }, relations: ['photographer', 'user'] });

    // Notify client of booking status change (in-app + email)
    if (booking && (status === 'accepted' || status === 'rejected')) {
      const label = status === 'accepted' ? 'accepted' : 'declined';
      const photographerName = booking.photographer?.name ?? 'the photographer';
      await this.notificationsService.create(
        booking.userId,
        'booking_update',
        `Booking ${label}`,
        `Your session request with ${photographerName} was ${label}.`,
        '/profile',
      );
      if (booking.user?.email) {
        this.emailService
          .sendBookingUpdate(booking.user.email, booking.user.name, photographerName, status as 'accepted' | 'rejected')
          .catch(() => null);
      }
    }

    return booking;
  }
}
