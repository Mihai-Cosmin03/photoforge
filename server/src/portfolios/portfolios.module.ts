import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Portfolio } from './portfolio.entity';
import { PortfolioImage } from './portfolio-image.entity';
import { PortfoliosService } from './portfolios.service';
import { PortfoliosController } from './portfolios.controller';
import { Category } from '../categories/category.entity';
import { Photographer } from '../photographers/photographer.entity';
import { PhotographersModule } from '../photographers/photographers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Portfolio, PortfolioImage, Category, Photographer]),
    forwardRef(() => PhotographersModule),
  ],
  providers: [PortfoliosService],
  controllers: [PortfoliosController],
  exports: [PortfoliosService],
})
export class PortfoliosModule {}
