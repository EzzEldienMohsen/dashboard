import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  FindManyStudentsParams,
  IStudentRepository,
  StudentEntity,
} from '../interfaces/student-repository.interface';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { paginate } from '../../common/utils/paginate';

const STUDENT_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  classId: true,
} as const;

@Injectable()
export class PrismaStudentRepository implements IStudentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<StudentEntity | null> {
    return this.prisma.student.findUnique({
      where: { id },
      select: STUDENT_SELECT,
    });
  }

  findMany(
    params: FindManyStudentsParams,
  ): Promise<PaginatedResult<StudentEntity>> {
    const { classId } = params;
    const where = classId ? { classId } : undefined;

    return paginate(
      params,
      ({ skip, take }) =>
        this.prisma.student.findMany({
          where,
          skip,
          take,
          select: STUDENT_SELECT,
        }),
      () => this.prisma.student.count({ where }),
    );
  }
}
