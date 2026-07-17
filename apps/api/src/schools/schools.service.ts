import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  SCHOOL_REPOSITORY,
  type ISchoolRepository,
} from './interfaces/school-repository.interface';
import { SchoolResponseDto } from './dto/school-response.dto';
import { SchoolNotFoundException } from '../common/exceptions/school-not-found.exception';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import type { ListSchoolsQueryDto } from './dto/list-schools-query.dto';
import { withServiceError } from '../common/utils/service-error';

@Injectable()
export class SchoolsService {
  private readonly logger = new Logger(SchoolsService.name);

  constructor(
    @Inject(SCHOOL_REPOSITORY) private readonly schools: ISchoolRepository,
  ) {}

  findById(id: string, schoolId: string): Promise<SchoolResponseDto> {
    return withServiceError(
      async () => {
        const school = await this.schools.findById(id, schoolId);
        if (!school) throw new SchoolNotFoundException(id);
        return SchoolResponseDto.fromEntity(school);
      },
      {
        logger: this.logger,
        notFound: {
          ExceptionClass: SchoolNotFoundException,
          warnContext: { msg: 'school not found', schoolId: id },
        },
        errorContext: { msg: 'findById failed unexpectedly', schoolId: id },
      },
    );
  }

  findMany(
    query: ListSchoolsQueryDto,
    schoolId: string,
  ): Promise<PaginatedResult<SchoolResponseDto>> {
    return withServiceError(
      async () => {
        const result = await this.schools.findMany({
          page: query.page,
          limit: query.limit,
          schoolId,
        });
        return {
          items: result.items.map((school) =>
            SchoolResponseDto.fromEntity(school),
          ),
          total: result.total,
          page: result.page,
          limit: result.limit,
        };
      },
      {
        logger: this.logger,
        errorContext: { msg: 'findMany failed unexpectedly', query },
      },
    );
  }
}
