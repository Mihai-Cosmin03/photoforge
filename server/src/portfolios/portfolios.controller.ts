import {
  Controller, Get, Post, Delete, Patch, Body, Param, Query, UseGuards, ForbiddenException, NotFoundException
} from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('portfolios')
export class PortfoliosController {
  constructor(private portfoliosService: PortfoliosService) {}

  @Get()
  findAll(
    @Query('categorySlug') categorySlug?: string,
    @Query('photographerSlug') photographerSlug?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.portfoliosService.findAll({
      categorySlug,
      photographerSlug,
      page: page ? +page : 1,
      limit: limit ? +limit : 12,
    });
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: any) {
    return this.portfoliosService.findByUserId(user.id);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.portfoliosService.findBySlugOrFail(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: any) {
    return this.portfoliosService.create(body);
  }

  @Post(':slug/images')
  @UseGuards(JwtAuthGuard)
  addImage(@Param('slug') slug: string, @Body('imageUrl') imageUrl: string) {
    return this.portfoliosService.addImageBySlug(slug, imageUrl);
  }

  @Delete('images/:imageId')
  @UseGuards(JwtAuthGuard)
  async deleteImage(@Param('imageId') imageId: string, @CurrentUser() user: any) {
    const owns = await this.portfoliosService.userOwnsImage(+imageId, user.id);
    if (!owns) throw new ForbiddenException('You do not own this image');
    return this.portfoliosService.deleteImage(+imageId);
  }

  @Patch(':slug/images/reorder')
  @UseGuards(JwtAuthGuard)
  async reorderImages(@Param('slug') slug: string, @Body('orderedIds') orderedIds: number[], @CurrentUser() user: any) {
    const portfolio = await this.portfoliosService.findBySlug(slug);
    if (!portfolio) throw new NotFoundException(`Portfolio '${slug}' not found`);
    const owns = await this.portfoliosService.userOwnsPortfolio(portfolio.id, user.id);
    if (!owns) throw new ForbiddenException('You do not own this portfolio');
    return this.portfoliosService.reorderImages(slug, orderedIds);
  }

  @Patch(':slug/materials-enabled')
  @UseGuards(JwtAuthGuard)
  async toggleMaterials(@Param('slug') slug: string, @Body('value') value: boolean, @CurrentUser() user: any) {
    const portfolio = await this.portfoliosService.findBySlug(slug);
    if (!portfolio) throw new NotFoundException(`Portfolio '${slug}' not found`);
    const owns = await this.portfoliosService.userOwnsPortfolio(portfolio.id, user.id);
    if (!owns) throw new ForbiddenException('You do not own this portfolio');
    return this.portfoliosService.toggleMaterialsEnabled(slug, value);
  }
}
