import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  FindManyStudentsParams,
  IStudentRepository,
  StudentEntity,
} from '../interfaces/student-repository.interface';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

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

  async findMany(
    params: FindManyStudentsParams,
  ): Promise<PaginatedResult<StudentEntity>> {
    const { page, limit, classId } = params;
    const skip = (page - 1) * limit;
    const where = classId ? { classId } : undefined;

    const [items, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        select: STUDENT_SELECT,
      }),
      this.prisma.student.count({ where }),
    ]);

    return { items, total, page, limit };
  }
}
