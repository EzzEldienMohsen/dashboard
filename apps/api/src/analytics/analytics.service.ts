import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ANALYTICS_REPOSITORY,
  type IAnalyticsRepository,
} from './interfaces/analytics-repository.interface';
import { AnalyticsResponseDto } from './dto/analytics-response.dto';
import { ClassNotFoundException } from '../common/exceptions/class-not-found.exception';
import { SchoolNotFoundException } from '../common/exceptions/school-not-found.exception';
import { withServiceError } from '../common/utils/service-error';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @Inject(ANALYTICS_REPOSITORY)
    private readonly analytics: IAnalyticsRepository,
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
        const snapshot = await this.analytics.getSnapshotForSchool(schoolId);
        return AnalyticsResponseDto.fromEntity(snapshot);
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
        const snapshot = await this.analytics.getSnapshotForClass(classId);
        return AnalyticsResponseDto.fromEntity(snapshot);
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
}
