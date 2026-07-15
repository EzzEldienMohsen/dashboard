import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  AnnouncementEntity,
  FindManyAnnouncementsParams,
  IAnnouncementRepository,
} from '../interfaces/announcement-repository.interface';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { paginate } from '../../common/utils/paginate';

const ANNOUNCEMENT_SELECT = {
  id: true,
  title: true,
  body: true,
  category: true,
  publishedAt: true,
} as const;

@Injectable()
export class PrismaAnnouncementRepository implements IAnnouncementRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<AnnouncementEntity | null> {
    return this.prisma.announcement.findUnique({
      where: { id },
      select: ANNOUNCEMENT_SELECT,
    });
  }

  findMany(
    params: FindManyAnnouncementsParams,
  ): Promise<PaginatedResult<AnnouncementEntity>> {
    const { category } = params;
    const where = category ? { category } : {};

    return paginate(
      params,
      ({ skip, take }) =>
        this.prisma.announcement.findMany({
          where,
          skip,
          take,
          select: ANNOUNCEMENT_SELECT,
          orderBy: { publishedAt: 'desc' },
        }),
      () => this.prisma.announcement.count({ where }),
    );
  }
}
