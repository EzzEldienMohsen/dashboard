import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  ClassEntity,
  FindManyClassesParams,
  IClassRepository,
} from '../interfaces/class-repository.interface';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { paginate } from '../../common/utils/paginate';

const CLASS_SELECT = { id: true, name: true, schoolId: true } as const;

@Injectable()
export class PrismaClassRepository implements IClassRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string, schoolId: string): Promise<ClassEntity | null> {
    return this.prisma.class.findFirst({
      where: { id, schoolId },
      select: CLASS_SELECT,
    });
  }

  findMany(
    params: FindManyClassesParams,
  ): Promise<PaginatedResult<ClassEntity>> {
    const where = { schoolId: params.schoolId };

    return paginate(
      params,
      ({ skip, take }) =>
        this.prisma.class.findMany({ where, skip, take, select: CLASS_SELECT }),
      () => this.prisma.class.count({ where }),
    );
  }
}
