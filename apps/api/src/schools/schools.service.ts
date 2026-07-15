import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  SCHOOL_REPOSITORY,
  type ISchoolRepository,
} from './interfaces/school-repository.interface';
import { SchoolResponseDto } from './dto/school-response.dto';
import { SchoolNotFoundException } from '../common/exceptions/school-not-found.exception';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import type { ListSchoolsQueryDto } from './dto/list-schools-query.dto';

@Injectable()
export class SchoolsService {
  private readonly logger = new Logger(SchoolsService.name);

  constructor(
    @Inject(SCHOOL_REPOSITORY) private readonly schools: ISchoolRepository,
  ) {}

  async findById(id: string): Promise<SchoolResponseDto> {
    try {
      const school = await this.schools.findById(id);
      if (!school) {
        throw new SchoolNotFoundException(id);
      }

      return SchoolResponseDto.fromEntity(school);
    } catch (err: unknown) {
      if (err instanceof SchoolNotFoundException) {
        this.logger.warn({ msg: 'school not found', schoolId: id });
        throw err;
      }
      this.logger.error({
        msg: 'findById failed unexpectedly',
        schoolId: id,
        err,
      });
      throw err; // rethrown for AllExceptionsFilter to normalize, log with breadcrumbs, and report to Sentry
    }
  }

  async findMany(
    query: ListSchoolsQueryDto,
  ): Promise<PaginatedResult<SchoolResponseDto>> {
    try {
      const result = await this.schools.findMany({
        page: query.page,
        limit: query.limit,
      });

      return {
        items: result.items.map((school) =>
          SchoolResponseDto.fromEntity(school),
        ),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (err: unknown) {
      this.logger.error({ msg: 'findMany failed unexpectedly', query, err });
      throw err; // rethrown for AllExceptionsFilter to normalize, log with breadcrumbs, and report to Sentry
    }
  }
}
