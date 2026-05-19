import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('photographers/:slug/packages')
export class PricingController {
  constructor(private pricingService: PricingService) {}

  @Get()
  getAll(@Param('slug') slug: string) {
    return this.pricingService.getByPhotographer(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Param('slug') slug: string, @Body() body: any) {
    return this.pricingService.create(slug, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() body: any) {
    return this.pricingService.update(+id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.pricingService.remove(+id);
  }
}
