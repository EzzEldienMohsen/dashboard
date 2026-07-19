import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ANALYTICS_REPOSITORY,
  type IAnalyticsRepository,
  type MonthlyRecords,
} from './interfaces/analytics-repository.interface';
import { AnalyticsResponseDto } from './dto/analytics-response.dto';
import { MonthlyAnalyticsResponseDto } from './dto/monthly-analytics-response.dto';
import { StudentAnalyticsResponseDto } from './dto/student-analytics-response.dto';
import { ClassSummaryResponseDto } from './dto/class-summary-response.dto';
import { AdviceGeneratorService } from './services/advice-generator.service';
import {
  buildMonthlyBuckets,
  computeImprovementRate,
} from './utils/monthly-performance.util';
import { classifySubjects } from './utils/subject-classification.util';
import { ClassNotFoundException } from '../common/exceptions/class-not-found.exception';
import { SchoolNotFoundException } from '../common/exceptions/school-not-found.exception';
import { StudentNotFoundException } from '../common/exceptions/student-not-found.exception';
import { withServiceError } from '../common/utils/service-error';

const DEFAULT_MONTHS_BACK = 6;

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @Inject(ANALYTICS_REPOSITORY)
    private readonly analytics: IAnalyticsRepository,
    private readonly adviceGenerator: AdviceGeneratorService,
  ) {}

  getSchoolAnalytics(
    schoolId: string,
    callerSchoolId: string,
  ): Promise<AnalyticsResponseDto> {
    return withServiceError(
      async () => {
        if (schoolId !== callerSchoolId) {
          throw new SchoolNotFoundException(schoolId);
        }
        const [snapshot, monthly] = await Promise.all([
          this.analytics.getSnapshotForSchool(schoolId),
          this.analytics.getMonthlyRecordsForSchool(
            schoolId,
            DEFAULT_MONTHS_BACK,
          ),
        ]);
        return AnalyticsResponseDto.fromEntity({
          ...snapshot,
          improvementRatePercentage: this.improvementRateFrom(monthly),
        });
      },
      {
        logger: this.logger,
        notFound: {
          ExceptionClass: SchoolNotFoundException,
          warnContext: { msg: 'school analytics not found', schoolId },
        },
        errorContext: {
          msg: 'getSchoolAnalytics failed unexpectedly',
          schoolId,
        },
      },
    );
  }

  getClassAnalytics(
    classId: string,
    callerSchoolId: string,
  ): Promise<AnalyticsResponseDto> {
    return withServiceError(
      async () => {
        const owned = await this.analytics.classBelongsToSchool(
          classId,
          callerSchoolId,
        );
        if (!owned) throw new ClassNotFoundException(classId);
        const [snapshot, monthly] = await Promise.all([
          this.analytics.getSnapshotForClass(classId),
          this.analytics.getMonthlyRecordsForClass(
            classId,
            DEFAULT_MONTHS_BACK,
          ),
        ]);
        return AnalyticsResponseDto.fromEntity({
          ...snapshot,
          improvementRatePercentage: this.improvementRateFrom(monthly),
        });
      },
      {
        logger: this.logger,
        notFound: {
          ExceptionClass: ClassNotFoundException,
          warnContext: {
            msg: 'class analytics not found',
            classId,
            callerSchoolId,
          },
        },
        errorContext: {
          msg: 'getClassAnalytics failed unexpectedly',
          classId,
        },
      },
    );
  }

  getStudentAnalytics(
    studentId: string,
    callerSchoolId: string,
    lang: string,
  ): Promise<StudentAnalyticsResponseDto> {
    return withServiceError(
      async () => {
        const owned = await this.analytics.studentBelongsToSchool(
          studentId,
          callerSchoolId,
        );
        if (!owned) throw new StudentNotFoundException(studentId);
        const [snapshot, monthly] = await Promise.all([
          this.analytics.getSnapshotForStudent(studentId),
          this.analytics.getMonthlyRecordsForStudent(
            studentId,
            DEFAULT_MONTHS_BACK,
          ),
        ]);
        const { strengths, weaknesses } = classifySubjects(
          snapshot.gradesBySubject,
        );
        const advice = this.adviceGenerator.generate(
          strengths,
          weaknesses,
          lang,
        );
        return StudentAnalyticsResponseDto.fromEntity({
          ...snapshot,
          improvementRatePercentage: this.improvementRateFrom(monthly),
          strengths,
          weaknesses,
          advice,
        });
      },
      {
        logger: this.logger,
        notFound: {
          ExceptionClass: StudentNotFoundException,
          warnContext: {
            msg: 'student analytics not found',
            studentId,
            callerSchoolId,
          },
        },
        errorContext: {
          msg: 'getStudentAnalytics failed unexpectedly',
          studentId,
        },
      },
    );
  }

  getSchoolMonthlyAnalytics(
    schoolId: string,
    callerSchoolId: string,
    months: number,
  ): Promise<MonthlyAnalyticsResponseDto[]> {
    return withServiceError(
      async () => {
        if (schoolId !== callerSchoolId) {
          throw new SchoolNotFoundException(schoolId);
        }
        const monthly = await this.analytics.getMonthlyRecordsForSchool(
          schoolId,
          months,
        );
        return MonthlyAnalyticsResponseDto.fromEntities(
          buildMonthlyBuckets(monthly.grades, monthly.attendance, months),
        );
      },
      {
        logger: this.logger,
        notFound: {
          ExceptionClass: SchoolNotFoundException,
          warnContext: {
            msg: 'school monthly analytics not found',
            schoolId,
          },
        },
        errorContext: {
          msg: 'getSchoolMonthlyAnalytics failed unexpectedly',
          schoolId,
        },
      },
    );
  }

  getClassMonthlyAnalytics(
    classId: string,
    callerSchoolId: string,
    months: number,
  ): Promise<MonthlyAnalyticsResponseDto[]> {
    return withServiceError(
      async () => {
        const owned = await this.analytics.classBelongsToSchool(
          classId,
          callerSchoolId,
        );
        if (!owned) throw new ClassNotFoundException(classId);
        const monthly = await this.analytics.getMonthlyRecordsForClass(
          classId,
          months,
        );
        return MonthlyAnalyticsResponseDto.fromEntities(
          buildMonthlyBuckets(monthly.grades, monthly.attendance, months),
        );
      },
      {
        logger: this.logger,
        notFound: {
          ExceptionClass: ClassNotFoundException,
          warnContext: {
            msg: 'class monthly analytics not found',
            classId,
            callerSchoolId,
          },
        },
        errorContext: {
          msg: 'getClassMonthlyAnalytics failed unexpectedly',
          classId,
        },
      },
    );
  }

  getStudentMonthlyAnalytics(
    studentId: string,
    callerSchoolId: string,
    months: number,
  ): Promise<MonthlyAnalyticsResponseDto[]> {
    return withServiceError(
      async () => {
        const owned = await this.analytics.studentBelongsToSchool(
          studentId,
          callerSchoolId,
        );
        if (!owned) throw new StudentNotFoundException(studentId);
        const monthly = await this.analytics.getMonthlyRecordsForStudent(
          studentId,
          months,
        );
        return MonthlyAnalyticsResponseDto.fromEntities(
          buildMonthlyBuckets(monthly.grades, monthly.attendance, months),
        );
      },
      {
        logger: this.logger,
        notFound: {
          ExceptionClass: StudentNotFoundException,
          warnContext: {
            msg: 'student monthly analytics not found',
            studentId,
            callerSchoolId,
          },
        },
        errorContext: {
          msg: 'getStudentMonthlyAnalytics failed unexpectedly',
          studentId,
        },
      },
    );
  }

  getClassesSummaryForSchool(
    schoolId: string,
    callerSchoolId: string,
  ): Promise<ClassSummaryResponseDto[]> {
    return withServiceError(
      async () => {
        if (schoolId !== callerSchoolId) {
          throw new SchoolNotFoundException(schoolId);
        }
        const snapshots =
          await this.analytics.getClassSnapshotsForSchool(schoolId);
        return ClassSummaryResponseDto.fromEntities(snapshots);
      },
      {
        logger: this.logger,
        notFound: {
          ExceptionClass: SchoolNotFoundException,
          warnContext: { msg: 'school classes summary not found', schoolId },
        },
        errorContext: {
          msg: 'getClassesSummaryForSchool failed unexpectedly',
          schoolId,
        },
      },
    );
  }

  private improvementRateFrom(monthly: MonthlyRecords): number {
    return computeImprovementRate(
      buildMonthlyBuckets(
        monthly.grades,
        monthly.attendance,
        DEFAULT_MONTHS_BACK,
      ),
    );
  }
}
