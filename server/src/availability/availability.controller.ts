import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('photographers/:slug/availability')
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @Get()
  get(
    @Param('slug') slug: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = year ? +year : new Date().getFullYear();
    const m = month ? +month : new Date().getMonth() + 1;
    return this.availabilityService.getByPhotographer(slug, y, m);
  }

  @Post('toggle')
  @UseGuards(JwtAuthGuard)
  toggle(
    @CurrentUser() user: any,
    @Body('date') date: string,
    @Body('available') available: boolean,
  ) {
    return this.availabilityService.toggle(user.id, date, available);
  }
}
