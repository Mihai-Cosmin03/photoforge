import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Photographer } from '../photographers/photographer.entity';
import { Portfolio } from '../portfolios/portfolio.entity';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Photographer, Portfolio])],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
