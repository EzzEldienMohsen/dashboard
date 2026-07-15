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

  findById(id: string): Promise<SchoolEntity | null> {
    return this.prisma.school.findUnique({
      where: { id },
      select: SCHOOL_SELECT,
    });
  }

  findMany(
    params: FindManySchoolsParams,
  ): Promise<PaginatedResult<SchoolEntity>> {
    return paginate(
      params,
      ({ skip, take }) =>
        this.prisma.school.findMany({ skip, take, select: SCHOOL_SELECT }),
      () => this.prisma.school.count(),
    );
  }
}
