import { Module } from '@nestjs/common';
import { PublicStatsController } from './public-stats.controller';
import { PublicStatsService } from './public-stats.service';
import { PUBLIC_STATS_REPOSITORY } from './interfaces/public-stats-repository.interface';
import { PrismaPublicStatsRepository } from './repositories/prisma-public-stats.repository';

@Module({
  controllers: [PublicStatsController],
  providers: [
    PublicStatsService,
    { provide: PUBLIC_STATS_REPOSITORY, useClass: PrismaPublicStatsRepository },
  ],
})
export class PublicStatsModule {}
