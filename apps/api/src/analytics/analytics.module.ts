import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ANALYTICS_REPOSITORY } from './interfaces/analytics-repository.interface';
import { PrismaAnalyticsRepository } from './repositories/prisma-analytics.repository';

@Module({
  providers: [
    AnalyticsService,
    { provide: ANALYTICS_REPOSITORY, useClass: PrismaAnalyticsRepository },
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
