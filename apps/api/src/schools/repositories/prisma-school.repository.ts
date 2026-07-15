import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  FindManySchoolsParams,
  ISchoolRepository,
  SchoolEntity,
} from '../interfaces/school-repository.interface';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

const SCHOOL_SELECT = { id: true, name: true, address: true } as const;

@Injectable()
export class PrismaSchoolRepository implements ISchoolRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<SchoolEntity | null> {
    return this.prisma.school.findUnique({
      where: { id },
      select: SCHOOL_SELECT,
    });
  }

  async findMany(
    params: FindManySchoolsParams,
  ): Promise<PaginatedResult<SchoolEntity>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.school.findMany({
        skip,
        take: limit,
        select: SCHOOL_SELECT,
      }),
      this.prisma.school.count(),
    ]);

    return { items, total, page, limit };
  }
}
