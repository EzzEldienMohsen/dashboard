import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { SchoolsController } from './schools.controller';
import { SchoolsService } from './schools.service';
import { SCHOOL_REPOSITORY } from './interfaces/school-repository.interface';
import { PrismaSchoolRepository } from './repositories/prisma-school.repository';

@Module({
  imports: [AuthModule, AnalyticsModule],
  controllers: [SchoolsController],
  providers: [
    SchoolsService,
    { provide: SCHOOL_REPOSITORY, useClass: PrismaSchoolRepository },
  ],
})
export class SchoolsModule {}
