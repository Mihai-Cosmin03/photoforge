import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleriesController } from './galleries.controller';
import { GalleriesService } from './galleries.service';
import { ClientGallery } from './gallery.entity';
import { Photographer } from '../photographers/photographer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClientGallery, Photographer])],
  controllers: [GalleriesController],
  providers: [GalleriesService],
})
export class GalleriesModule {}
