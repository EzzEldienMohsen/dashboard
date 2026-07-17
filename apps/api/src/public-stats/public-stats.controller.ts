import { Controller, Get, Header, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { PublicStatsService } from './public-stats.service';
import { PublicStatsResponseDto } from './dto/public-stats-response.dto';

// Public endpoint — no auth/role guards by design.
@Controller('public/stats')
@UseInterceptors(CacheInterceptor)
export class PublicStatsController {
  constructor(private readonly publicStatsService: PublicStatsService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=3600')
  getStats(): Promise<PublicStatsResponseDto> {
    return this.publicStatsService.getStats();
  }
}
