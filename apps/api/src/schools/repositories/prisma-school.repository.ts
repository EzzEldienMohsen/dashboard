import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  FindManySchoolsParams,
  ISchoolRepository,
  SchoolEntity,
} from '../interfaces/school-repository.interface';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { paginate } from '../../common/utils/paginate';

const SCHOOL_SELECT = { id: true, name: true, address: true } as const;

@Injectable()
export class PrismaSchoolRepository implements ISchoolRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string, callerSchoolId: string): Promise<SchoolEntity | null> {
    if (id !== callerSchoolId) return Promise.resolve(null);
    return this.prisma.school.findUnique({
      where: { id },
      select: SCHOOL_SELECT,
    });
  }

  findMany(
    params: FindManySchoolsParams,
  ): Promise<PaginatedResult<SchoolEntity>> {
    const where = { id: params.schoolId };
    return paginate(
      params,
      ({ skip, take }) =>
        this.prisma.school.findMany({
          where,
          skip,
          take,
          select: SCHOOL_SELECT,
        }),
      () => this.prisma.school.count({ where }),
    );
  }

  async existsById(id: string): Promise<boolean> {
    const school = await this.prisma.school.findUnique({
      where: { id },
      select: { id: true },
    });
    return school !== null;
  }

  async resolveDefaultSchoolId(): Promise<string | null> {
    const school = await this.prisma.school.findFirst({
      select: { id: true },
    });
    return school?.id ?? null;
  }
}
