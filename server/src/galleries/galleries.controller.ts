import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query, Request } from '@nestjs/common';
import { GalleriesService } from './galleries.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('galleries')
export class GalleriesController {
  constructor(private galleriesService: GalleriesService) {}

  // Photographer: get their galleries
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  getMine(@CurrentUser() user: any) {
    return this.galleriesService.getMine(user.id);
  }

  // Photographer: create gallery
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.galleriesService.create(user.id, body);
  }

  // Photographer: add images to gallery
  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  addImages(@Param('id') id: string, @CurrentUser() user: any, @Body('urls') urls: string[]) {
    return this.galleriesService.addImages(id, user.id, urls);
  }

  // Photographer: remove a single image from gallery
  @Delete(':id/images')
  @UseGuards(JwtAuthGuard)
  removeImage(@Param('id') id: string, @CurrentUser() user: any, @Body('url') url: string) {
    return this.galleriesService.removeImage(id, user.id, url);
  }

  // Photographer: update gallery metadata
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() body: any) {
    return this.galleriesService.update(id, user.id, body);
  }

  // Photographer: delete gallery
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.galleriesService.remove(id, user.id);
  }

  // Client: access gallery by code (optionally pass email for restricted galleries)
  @Get('view/:code')
  viewByCode(@Param('code') code: string, @Query('email') email?: string) {
    return this.galleriesService.getByCode(code, email);
  }
}
