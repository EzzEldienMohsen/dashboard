import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  STUDENT_REPOSITORY,
  type IStudentRepository,
} from './interfaces/student-repository.interface';
import { StudentResponseDto } from './dto/student-response.dto';
import { StudentNotFoundException } from '../common/exceptions/student-not-found.exception';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import type { ListStudentsQueryDto } from './dto/list-students-query.dto';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    @Inject(STUDENT_REPOSITORY) private readonly students: IStudentRepository,
  ) {}

  async findById(id: string): Promise<StudentResponseDto> {
    try {
      const student = await this.students.findById(id);
      if (!student) {
        throw new StudentNotFoundException(id);
      }

      return StudentResponseDto.fromEntity(student);
    } catch (err: unknown) {
      if (err instanceof StudentNotFoundException) {
        this.logger.warn({ msg: 'student not found', studentId: id });
        throw err;
      }
      this.logger.error({
        msg: 'findById failed unexpectedly',
        studentId: id,
        err,
      });
      throw err; // rethrown for AllExceptionsFilter to normalize, log with breadcrumbs, and report to Sentry
    }
  }

  async findMany(
    query: ListStudentsQueryDto,
  ): Promise<PaginatedResult<StudentResponseDto>> {
    try {
      const result = await this.students.findMany({
        page: query.page,
        limit: query.limit,
        classId: query.classId,
      });

      return {
        items: result.items.map((student) =>
          StudentResponseDto.fromEntity(student),
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
