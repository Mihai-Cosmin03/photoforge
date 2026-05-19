import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards, HttpCode, ForbiddenException, ConflictException
} from '@nestjs/common';
import { PhotographersService } from './photographers.service';
import { PortfoliosService } from '../portfolios/portfolios.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('photographers')
export class PhotographersController {
  constructor(
    private photographersService: PhotographersService,
    private portfoliosService: PortfoliosService,
  ) {}

  @Get()
  findAll(
    @Query('city') city?: string,
    @Query('specialty') specialty?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.photographersService.findAll({
      city,
      specialty,
      page: page ? +page : 1,
      limit: limit ? +limit : 12,
    });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: any) {
    return this.photographersService.findByUserId(user.id);
  }

  @Get('my/dashboard')
  @UseGuards(JwtAuthGuard)
  getDashboard(@CurrentUser() user: any) {
    return this.photographersService.getDashboard(user.id);
  }

  @Put('my')
  @UseGuards(JwtAuthGuard)
  updateMine(@CurrentUser() user: any, @Body() body: any) {
    return this.photographersService.updateByUserId(user.id, body);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.photographersService.findBySlugOrFail(slug);
  }

  @Get(':slug/stats')
  getStats(@Param('slug') slug: string) {
    return this.photographersService.getStats(slug);
  }

  @Post(':slug/view')
  @HttpCode(204)
  recordView(@Param('slug') slug: string) {
    return this.photographersService.incrementViews(slug);
  }

  @Get(':slug/portfolios')
  findPortfolios(@Param('slug') slug: string) {
    return this.portfoliosService.findAll({ photographerSlug: slug });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: any, @CurrentUser() user: any) {
    const existing = await this.photographersService.findByUserId(user.id);
    if (existing) throw new ConflictException('You already have a photographer profile');
    return this.photographersService.create({ ...body, userId: user.id });
  }

  @Put(':slug')
  @UseGuards(JwtAuthGuard)
  async update(@Param('slug') slug: string, @Body() body: any, @CurrentUser() user: any) {
    const ph = await this.photographersService.findBySlugOrFail(slug);
    if (ph.userId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You do not own this photographer profile');
    }
    return this.photographersService.update(slug, body);
  }
}
