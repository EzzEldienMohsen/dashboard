import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  CLASS_REPOSITORY,
  type IClassRepository,
} from './interfaces/class-repository.interface';
import { ClassResponseDto } from './dto/class-response.dto';
import { ClassNotFoundException } from '../common/exceptions/class-not-found.exception';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import type { ListClassesQueryDto } from './dto/list-classes-query.dto';
import { withServiceError } from '../common/utils/service-error';

@Injectable()
export class ClassesService {
  private readonly logger = new Logger(ClassesService.name);

  constructor(
    @Inject(CLASS_REPOSITORY) private readonly classes: IClassRepository,
  ) {}

  findById(id: string, schoolId: string): Promise<ClassResponseDto> {
    return withServiceError(
      async () => {
        const classEntity = await this.classes.findById(id, schoolId);
        if (!classEntity) throw new ClassNotFoundException(id);
        return ClassResponseDto.fromEntity(classEntity);
      },
      {
        logger: this.logger,
        notFound: {
          ExceptionClass: ClassNotFoundException,
          warnContext: { msg: 'class not found', classId: id, schoolId },
        },
        errorContext: {
          msg: 'findById failed unexpectedly',
          classId: id,
          schoolId,
        },
      },
    );
  }

  findMany(
    query: ListClassesQueryDto,
    schoolId: string,
  ): Promise<PaginatedResult<ClassResponseDto>> {
    return withServiceError(
      async () => {
        const result = await this.classes.findMany({
          page: query.page,
          limit: query.limit,
          schoolId,
        });
        return {
          items: result.items.map((classEntity) =>
            ClassResponseDto.fromEntity(classEntity),
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
