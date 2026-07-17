import { Inject, Injectable } from '@nestjs/common';
import {
  PUBLIC_STATS_REPOSITORY,
  type IPublicStatsRepository,
} from './interfaces/public-stats-repository.interface';
import { PublicStatsResponseDto } from './dto/public-stats-response.dto';

@Injectable()
export class PublicStatsService {
  constructor(
    @Inject(PUBLIC_STATS_REPOSITORY)
    private readonly publicStats: IPublicStatsRepository,
  ) {}

  getStats(): Promise<PublicStatsResponseDto> {
    return this.publicStats.getCounts();
  }
}
