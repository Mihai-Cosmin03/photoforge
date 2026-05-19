import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { PhotographersService } from '../photographers/photographers.service';
import { PortfoliosService } from '../portfolios/portfolios.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private photographersService: PhotographersService,
    private portfoliosService: PortfoliosService,
  ) {}

  @Get()
  async getProfile(@CurrentUser() user: any) {
    const profile = await this.usersService.getProfile(user.id);
    const { passwordHash, ...safe } = profile as any;
    return safe;
  }

  @Put()
  async updateProfile(
    @CurrentUser() user: any,
    @Body() body: { name?: string; bio?: string; avatar?: string | null; avatarIndex?: number | null },
  ) {
    const updated = await this.usersService.updateProfile(user.id, body);
    const { passwordHash, resetPasswordToken, resetPasswordExpires, ...safe } = updated as any;
    return safe;
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (_, file, cb) => cb(null, `avatar-${uuidv4()}${extname(file.originalname)}`),
    }),
    fileFilter: (_, file, cb) => {
      if (!file.mimetype.match(/^image\/(jpeg|png|webp|gif)$/)) {
        return cb(new BadRequestException('Only image files are allowed'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  }))
  async uploadAvatar(@CurrentUser() user: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const url = `/uploads/${file.filename}`;
    await this.usersService.updateProfile(user.id, { avatar: url });
    // Sync to photographer profile if user has one
    await this.photographersService.updateByUserId(user.id, { avatar: url }).catch(() => null);
    return { url };
  }

  @Post('save/photographer/:slug')
  async savePhotographer(@CurrentUser() user: any, @Param('slug') slug: string) {
    const photographer = await this.photographersService.findBySlug(slug);
    if (!photographer) throw new NotFoundException('Photographer not found');
    await this.usersService.savePhotographer(user.id, photographer);
    return { message: 'Saved' };
  }

  @Delete('save/photographer/:slug')
  async unsavePhotographer(@CurrentUser() user: any, @Param('slug') slug: string) {
    const photographer = await this.photographersService.findBySlug(slug);
    if (!photographer) throw new NotFoundException('Photographer not found');
    await this.usersService.unsavePhotographer(user.id, photographer.id);
    return { message: 'Removed' };
  }

  @Post('save/portfolio/:slug')
  async savePortfolio(@CurrentUser() user: any, @Param('slug') slug: string) {
    const portfolio = await this.portfoliosService.findBySlug(slug);
    if (!portfolio) throw new NotFoundException('Portfolio not found');
    await this.usersService.savePortfolio(user.id, portfolio);
    return { message: 'Saved' };
  }

  @Delete('save/portfolio/:slug')
  async unsavePortfolio(@CurrentUser() user: any, @Param('slug') slug: string) {
    const portfolio = await this.portfoliosService.findBySlug(slug);
    if (!portfolio) throw new NotFoundException('Portfolio not found');
    await this.usersService.unsavePortfolio(user.id, portfolio.id);
    return { message: 'Removed' };
  }
}
