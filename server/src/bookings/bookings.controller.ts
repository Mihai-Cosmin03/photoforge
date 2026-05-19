import { Controller, Get, Post, Patch, Body, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  getMyBookings(@CurrentUser() user: any) {
    return this.bookingsService.getMyBookings(user.id);
  }

  @Get('requests')
  @UseGuards(JwtAuthGuard)
  getRequests(@CurrentUser() user: any) {
    return this.bookingsService.getIncomingRequests(user.id);
  }

  @Post(':slug')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('slug') slug: string,
    @CurrentUser() user: any,
    @Body() body: any,
  ) {
    return this.bookingsService.createBooking(user.id, slug, body);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    const allowed = await this.bookingsService.isPhotographerOfBooking(id, user.id);
    if (!allowed) throw new ForbiddenException('Only the photographer of this booking can update its status');
    return this.bookingsService.updateStatus(id, body.status, body.note);
  }
}
