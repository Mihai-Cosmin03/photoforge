import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  search(
    @Query('q') q: string,
    @Query('city') city?: string,
    @Query('specialty') specialty?: string,
    @Query('sortBy') sortBy?: string,
    @Query('type') type?: string,
  ) {
    if (!q || q.trim().length < 2) return { photographers: [], portfolios: [] };
    return this.searchService.search(q.trim(), { city, specialty, sortBy: sortBy as any, type: type as any });
  }
}
