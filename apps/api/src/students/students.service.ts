import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  STUDENT_REPOSITORY,
  type IStudentRepository,
} from './interfaces/student-repository.interface';
import { StudentResponseDto } from './dto/student-response.dto';
import { StudentNotFoundException } from '../common/exceptions/student-not-found.exception';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import type { ListStudentsQueryDto } from './dto/list-students-query.dto';
import { withServiceError } from '../common/utils/service-error';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    @Inject(STUDENT_REPOSITORY) private readonly students: IStudentRepository,
  ) {}

  findById(id: string, schoolId: string): Promise<StudentResponseDto> {
    return withServiceError(
      async () => {
        const student = await this.students.findById(id, schoolId);
        if (!student) throw new StudentNotFoundException(id);
        return StudentResponseDto.fromEntity(student);
      },
      {
        logger: this.logger,
        notFound: {
          ExceptionClass: StudentNotFoundException,
          warnContext: { msg: 'student not found', studentId: id, schoolId },
        },
        errorContext: {
          msg: 'findById failed unexpectedly',
          studentId: id,
          schoolId,
        },
      },
    );
  }

  findMany(
    query: ListStudentsQueryDto,
    schoolId: string,
  ): Promise<PaginatedResult<StudentResponseDto>> {
    return withServiceError(
      async () => {
        const result = await this.students.findMany({
          page: query.page,
          limit: query.limit,
          schoolId,
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
      },
      {
        logger: this.logger,
        errorContext: { msg: 'findMany failed unexpectedly', query },
      },
    );
  }
}
