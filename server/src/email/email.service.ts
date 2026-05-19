import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter | null = null;
  private readonly logger = new Logger(EmailService.name);
  private readonly from: string;
  private readonly frontendUrl: string;

  constructor(private config: ConfigService) {
    this.from = config.get<string>('MAIL_FROM') ?? 'PhotoForge <noreply@photoforge.app>';
    this.frontendUrl = config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';

    const host = config.get<string>('MAIL_HOST');
    const user = config.get<string>('MAIL_USER');

    if (host && user) {
      this.transporter = nodemailer.createTransport({
        host,
        port: config.get<number>('MAIL_PORT') ?? 587,
        secure: config.get<string>('MAIL_SECURE') === 'true',
        auth: { user, pass: config.get<string>('MAIL_PASS') },
      });
      this.logger.log(`Email transport configured: ${host}`);
    } else {
      this.logger.warn('Email transport not configured — emails will be skipped');
    }
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.transporter) return;
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${(err as Error).message}`);
    }
  }

  private wrap(title: string, body: string) {
    return `
      <!DOCTYPE html><html><body style="margin:0;padding:0;background:#0f0f12;font-family:sans-serif;">
      <div style="max-width:520px;margin:40px auto;background:#1a1a24;border:1px solid #2d2d3d;border-radius:12px;overflow:hidden;">
        <div style="padding:24px 32px;border-bottom:1px solid #2d2d3d;">
          <span style="font-size:1.2rem;font-weight:700;color:#fff;">Photo<span style="color:#8b5cf6;">Forge</span></span>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#fff;font-size:1.3rem;margin:0 0 16px;">${title}</h2>
          ${body}
        </div>
        <div style="padding:16px 32px;border-top:1px solid #2d2d3d;text-align:center;">
          <p style="color:#6b7280;font-size:0.75rem;margin:0;">© 2025 PhotoForge. All rights reserved.</p>
        </div>
      </div></body></html>
    `;
  }

  async sendWelcome(to: string, name: string) {
    const html = this.wrap('Welcome to PhotoForge!', `
      <p style="color:#c4c4d4;line-height:1.6;margin:0 0 20px;">Hi <strong style="color:#fff;">${name}</strong>,</p>
      <p style="color:#c4c4d4;line-height:1.6;margin:0 0 24px;">
        Your account is ready. Explore photographers, save your favourites, and book your next session.
      </p>
      <a href="${this.frontendUrl}" style="display:inline-block;background:#8b5cf6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        Browse Photographers
      </a>
    `);
    await this.send(to, 'Welcome to PhotoForge!', html);
  }

  async sendPasswordReset(to: string, name: string, token: string) {
    const link = `${this.frontendUrl}/reset-password?token=${token}`;
    const html = this.wrap('Reset your password', `
      <p style="color:#c4c4d4;line-height:1.6;margin:0 0 20px;">Hi <strong style="color:#fff;">${name}</strong>,</p>
      <p style="color:#c4c4d4;line-height:1.6;margin:0 0 24px;">
        We received a request to reset your password. Click the button below — the link expires in <strong style="color:#fff;">1 hour</strong>.
      </p>
      <a href="${link}" style="display:inline-block;background:#8b5cf6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        Reset Password
      </a>
      <p style="color:#6b7280;font-size:0.8rem;margin:24px 0 0;">If you didn't request this, you can safely ignore this email.</p>
    `);
    await this.send(to, 'Reset your PhotoForge password', html);
  }

  async sendBookingRequest(to: string, photographerName: string, date: string) {
    const html = this.wrap('New booking request', `
      <p style="color:#c4c4d4;line-height:1.6;margin:0 0 20px;">Hi <strong style="color:#fff;">${photographerName}</strong>,</p>
      <p style="color:#c4c4d4;line-height:1.6;margin:0 0 24px;">
        You have a new session request for <strong style="color:#fff;">${date}</strong>.
        Log in to review and respond.
      </p>
      <a href="${this.frontendUrl}/profile" style="display:inline-block;background:#8b5cf6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        View Request
      </a>
    `);
    await this.send(to, 'New booking request on PhotoForge', html);
  }

  async sendBookingUpdate(to: string, clientName: string, photographerName: string, status: 'accepted' | 'rejected') {
    const label = status === 'accepted' ? 'accepted' : 'declined';
    const emoji = status === 'accepted' ? '🎉' : '😔';
    const html = this.wrap(`Booking ${label} ${emoji}`, `
      <p style="color:#c4c4d4;line-height:1.6;margin:0 0 20px;">Hi <strong style="color:#fff;">${clientName}</strong>,</p>
      <p style="color:#c4c4d4;line-height:1.6;margin:0 0 24px;">
        <strong style="color:#fff;">${photographerName}</strong> has <strong style="color:#fff;">${label}</strong> your booking request.
        ${status === 'accepted' ? 'They will be in touch with further details.' : 'Feel free to browse other photographers.'}
      </p>
      <a href="${this.frontendUrl}/profile" style="display:inline-block;background:#8b5cf6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        View My Bookings
      </a>
    `);
    await this.send(to, `Your PhotoForge booking was ${label}`, html);
  }

  async sendNewMessage(to: string, recipientName: string, senderName: string, preview: string) {
    const html = this.wrap(`New message from ${senderName}`, `
      <p style="color:#c4c4d4;line-height:1.6;margin:0 0 20px;">Hi <strong style="color:#fff;">${recipientName}</strong>,</p>
      <p style="color:#c4c4d4;line-height:1.6;margin:0 0 8px;">
        <strong style="color:#fff;">${senderName}</strong> sent you a message:
      </p>
      <blockquote style="border-left:3px solid #8b5cf6;margin:0 0 24px;padding:12px 16px;background:#13131c;border-radius:0 8px 8px 0;">
        <p style="color:#e2e2f0;font-style:italic;margin:0;">"${preview}"</p>
      </blockquote>
      <a href="${this.frontendUrl}/conversations" style="display:inline-block;background:#8b5cf6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        Reply
      </a>
    `);
    await this.send(to, `New message from ${senderName} on PhotoForge`, html);
  }

  async sendPortfolioApproved(to: string, name: string, portfolioTitle: string, portfolioSlug: string) {
    const html = this.wrap('Portfolio approved! 🎉', `
      <p style="color:#c4c4d4;line-height:1.6;margin:0 0 20px;">Hi <strong style="color:#fff;">${name}</strong>,</p>
      <p style="color:#c4c4d4;line-height:1.6;margin:0 0 24px;">
        Your portfolio <strong style="color:#fff;">"${portfolioTitle}"</strong> has been approved and is now live on PhotoForge.
      </p>
      <a href="${this.frontendUrl}/portfolio/${portfolioSlug}" style="display:inline-block;background:#8b5cf6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        View Portfolio
      </a>
    `);
    await this.send(to, `Your portfolio "${portfolioTitle}" is now live!`, html);
  }
}
