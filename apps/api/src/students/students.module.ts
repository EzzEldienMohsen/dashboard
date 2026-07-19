import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { STUDENT_REPOSITORY } from './interfaces/student-repository.interface';
import { PrismaStudentRepository } from './repositories/prisma-student.repository';

@Module({
  imports: [AuthModule, AnalyticsModule],
  controllers: [StudentsController],
  providers: [
    StudentsService,
    { provide: STUDENT_REPOSITORY, useClass: PrismaStudentRepository },
  ],
})
export class StudentsModule {}
