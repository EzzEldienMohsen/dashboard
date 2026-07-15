import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ANNOUNCEMENT_REPOSITORY,
  type IAnnouncementRepository,
} from './interfaces/announcement-repository.interface';
import { AnnouncementResponseDto } from './dto/announcement-response.dto';
import { AnnouncementNotFoundException } from '../common/exceptions/announcement-not-found.exception';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import type { ListAnnouncementsQueryDto } from './dto/list-announcements-query.dto';

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);

  constructor(
    @Inject(ANNOUNCEMENT_REPOSITORY)
    private readonly announcements: IAnnouncementRepository,
  ) {}

  async findById(id: string): Promise<AnnouncementResponseDto> {
    try {
      const announcement = await this.announcements.findById(id);
      if (!announcement) {
        throw new AnnouncementNotFoundException(id);
      }

      return AnnouncementResponseDto.fromEntity(announcement);
    } catch (err: unknown) {
      if (err instanceof AnnouncementNotFoundException) {
        this.logger.warn({ msg: 'announcement not found', announcementId: id });
        throw err;
      }
      this.logger.error({
        msg: 'findById failed unexpectedly',
        announcementId: id,
        err,
      });
      throw err; // rethrown for AllExceptionsFilter to normalize, log with breadcrumbs, and report to Sentry
    }
  }

  async findMany(
    query: ListAnnouncementsQueryDto,
  ): Promise<PaginatedResult<AnnouncementResponseDto>> {
    try {
      const result = await this.announcements.findMany({
        page: query.page,
        limit: query.limit,
        category: query.category,
      });

      return {
        items: result.items.map((announcement) =>
          AnnouncementResponseDto.fromEntity(announcement),
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
