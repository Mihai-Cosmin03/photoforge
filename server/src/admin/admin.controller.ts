import { Controller, Get, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PortfoliosService } from '../portfolios/portfolios.service';
import { PhotographersService } from '../photographers/photographers.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { ReviewsService } from '../reviews/reviews.service';
import { AuditLogService } from './audit-log.service';
import type { UserRole } from '../users/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private portfoliosService: PortfoliosService,
    private photographersService: PhotographersService,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
    private reviewsService: ReviewsService,
    private auditLogService: AuditLogService,
  ) {}

  @Get('portfolios/pending')
  getPendingPortfolios() {
    return this.portfoliosService.findPending();
  }

  @Delete('portfolios/empty')
  deleteEmptyPortfolios(@CurrentUser() admin: any) {
    this.auditLogService.log(admin.id, admin.name, 'delete_empty_portfolios', 'Deleted all empty portfolios').catch(() => null);
    return this.portfoliosService.deleteEmpty();
  }

  @Delete('portfolios/broken-images')
  cleanBrokenImages(@CurrentUser() admin: any) {
    this.auditLogService.log(admin.id, admin.name, 'clean_broken_images', 'Removed broken local-path images').catch(() => null);
    return this.portfoliosService.cleanBrokenImages();
  }

  @Get('audit-log')
  getAuditLog() {
    return this.auditLogService.findAll();
  }

  @Patch('portfolios/:id/approve')
  async approvePortfolio(@Param('id') id: string, @CurrentUser() admin: any) {
    const portfolio = await this.portfoliosService.updateStatus(+id, 'approved');
    this.auditLogService.log(admin.id, admin.name, 'approve_portfolio', `Portfolio #${id}: "${portfolio?.title}"`).catch(() => null);
    if (portfolio?.photographer?.userId) {
      await this.notificationsService.create(
        portfolio.photographer.userId,
        'application',
        'Portfolio approved',
        `Your portfolio "${portfolio.title}" has been approved and is now live.`,
        `/portfolio/${portfolio.slug}`,
      );
      // Get photographer user for email
      const phUser = await this.usersService.findById(portfolio.photographer.userId);
      if (phUser) {
        this.emailService
          .sendPortfolioApproved(phUser.email, phUser.name, portfolio.title, portfolio.slug)
          .catch(() => null);
      }
    }
    return portfolio;
  }

  @Patch('portfolios/:id/reject')
  async rejectPortfolio(@Param('id') id: string, @CurrentUser() admin: any) {
    const portfolio = await this.portfoliosService.updateStatus(+id, 'rejected');
    this.auditLogService.log(admin.id, admin.name, 'reject_portfolio', `Portfolio #${id}: "${portfolio?.title}"`).catch(() => null);
    if (portfolio?.photographer?.userId) {
      await this.notificationsService.create(
        portfolio.photographer.userId,
        'application',
        'Portfolio needs changes',
        `Your portfolio "${portfolio.title}" requires some adjustments before it can be published.`,
        '/profile',
      );
    }
    return portfolio;
  }

  @Get('photographers/pending')
  getPendingPhotographers() {
    return this.photographersService.findPending();
  }

  @Patch('photographers/:id/approve')
  async approvePhotographer(@Param('id') id: string, @CurrentUser() admin: any) {
    const photographer = await this.photographersService.updateStatus(+id, 'approved');
    this.auditLogService.log(admin.id, admin.name, 'approve_photographer', `Photographer #${id}: "${photographer?.name}"`).catch(() => null);
    if (photographer?.userId) {
      await this.notificationsService.create(
        photographer.userId,
        'application',
        'Photographer profile approved',
        'Congratulations! Your photographer profile is now live on PhotoForge.',
        `/photographers/${photographer.slug}`,
      );
    }
    return photographer;
  }

  // ── Global statistics ───────────────────────────────────────────────

  @Get('stats')
  async getStats() {
    return this.usersService.getGlobalStats();
  }

  // ── User management ─────────────────────────────────────────────────

  @Get('users')
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
    @CurrentUser() admin: { id: string; name: string },
  ) {
    const result = await this.usersService.updateRole(id, role, admin.id);
    this.auditLogService.log(admin.id, admin.name, 'change_role', `User #${id} → role: ${role}`).catch(() => null);
    return result;
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @CurrentUser() admin: { id: string; name: string }) {
    const result = await this.usersService.deleteUser(id, admin.id);
    this.auditLogService.log(admin.id, admin.name, 'delete_user', `User #${id}`).catch(() => null);
    return result;
  }

  // ── Reviews moderation ──────────────────────────────────────────────

  @Get('reviews')
  getAllReviews(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.reviewsService.findAll({ page: page ? +page : 1, limit: limit ? +limit : 50 });
  }

  @Delete('reviews/:id')
  async deleteReview(@Param('id') id: string, @CurrentUser() admin: any) {
    const result = await this.reviewsService.deleteById(+id);
    this.auditLogService.log(admin.id, admin.name, 'delete_review', `Review #${id}`).catch(() => null);
    return result;
  }
}
