import { Controller, Get, Post, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('photographers/:slug/reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get()
  getAll(@Param('slug') slug: string) {
    return this.reviewsService.getByPhotographer(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('slug') slug: string,
    @CurrentUser() user: any,
    @Body('rating') rating: number,
    @Body('text') text: string,
  ) {
    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      throw new BadRequestException('Rating must be an integer between 1 and 5');
    }
    if (!text || text.trim().length < 5) {
      throw new BadRequestException('Review text must be at least 5 characters');
    }
    return this.reviewsService.create(slug, user.id, r, text.trim());
  }
}
