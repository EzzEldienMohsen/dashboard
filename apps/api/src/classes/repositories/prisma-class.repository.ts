import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  ClassEntity,
  FindManyClassesParams,
  IClassRepository,
} from '../interfaces/class-repository.interface';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

const CLASS_SELECT = { id: true, name: true, schoolId: true } as const;

@Injectable()
export class PrismaClassRepository implements IClassRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<ClassEntity | null> {
    return this.prisma.class.findUnique({
      where: { id },
      select: CLASS_SELECT,
    });
  }

  async findMany(
    params: FindManyClassesParams,
  ): Promise<PaginatedResult<ClassEntity>> {
    const { page, limit, schoolId } = params;
    const skip = (page - 1) * limit;
    const where = schoolId ? { schoolId } : undefined;

    const [items, total] = await Promise.all([
      this.prisma.class.findMany({
        where,
        skip,
        take: limit,
        select: CLASS_SELECT,
      }),
      this.prisma.class.count({ where }),
    ]);

    return { items, total, page, limit };
  }
}
