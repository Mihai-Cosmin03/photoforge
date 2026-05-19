import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Photographer } from './photographer.entity';
import { PhotographersService } from './photographers.service';
import { PhotographersController } from './photographers.controller';
import { PortfoliosModule } from '../portfolios/portfolios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Photographer]),
    forwardRef(() => PortfoliosModule),
  ],
  providers: [PhotographersService],
  controllers: [PhotographersController],
  exports: [PhotographersService],
})
export class PhotographersModule {}
