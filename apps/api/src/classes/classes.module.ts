import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { CLASS_REPOSITORY } from './interfaces/class-repository.interface';
import { PrismaClassRepository } from './repositories/prisma-class.repository';

@Module({
  imports: [AuthModule, AnalyticsModule],
  controllers: [ClassesController],
  providers: [
    ClassesService,
    { provide: CLASS_REPOSITORY, useClass: PrismaClassRepository },
  ],
})
export class ClassesModule {}
