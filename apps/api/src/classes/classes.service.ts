import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  CLASS_REPOSITORY,
  type IClassRepository,
} from './interfaces/class-repository.interface';
import { ClassResponseDto } from './dto/class-response.dto';
import { ClassNotFoundException } from '../common/exceptions/class-not-found.exception';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import type { ListClassesQueryDto } from './dto/list-classes-query.dto';

@Injectable()
export class ClassesService {
  private readonly logger = new Logger(ClassesService.name);

  constructor(
    @Inject(CLASS_REPOSITORY) private readonly classes: IClassRepository,
  ) {}

  async findById(id: string): Promise<ClassResponseDto> {
    try {
      const classEntity = await this.classes.findById(id);
      if (!classEntity) {
        throw new ClassNotFoundException(id);
      }

      return ClassResponseDto.fromEntity(classEntity);
    } catch (err: unknown) {
      if (err instanceof ClassNotFoundException) {
        this.logger.warn({ msg: 'class not found', classId: id });
        throw err;
      }
      this.logger.error({
        msg: 'findById failed unexpectedly',
        classId: id,
        err,
      });
      throw err; // rethrown for AllExceptionsFilter to normalize, log with breadcrumbs, and report to Sentry
    }
  }

  async findMany(
    query: ListClassesQueryDto,
  ): Promise<PaginatedResult<ClassResponseDto>> {
    try {
      const result = await this.classes.findMany({
        page: query.page,
        limit: query.limit,
        schoolId: query.schoolId,
      });

      return {
        items: result.items.map((classEntity) =>
          ClassResponseDto.fromEntity(classEntity),
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
