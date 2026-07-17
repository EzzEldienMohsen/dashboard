import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ANNOUNCEMENT_REPOSITORY,
  type IAnnouncementRepository,
} from './interfaces/announcement-repository.interface';
import { AnnouncementResponseDto } from './dto/announcement-response.dto';
import { AnnouncementNotFoundException } from '../common/exceptions/announcement-not-found.exception';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import type { ListAnnouncementsQueryDto } from './dto/list-announcements-query.dto';
import type { CursorPaginatedResult } from '../common/interfaces/cursor-paginated-result.interface';
import type { CursorPaginationQueryDto } from '../common/dto/cursor-pagination-query.dto';
import { withServiceError } from '../common/utils/service-error';

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);

  constructor(
    @Inject(ANNOUNCEMENT_REPOSITORY)
    private readonly announcements: IAnnouncementRepository,
  ) {}

  findById(id: string): Promise<AnnouncementResponseDto> {
    return withServiceError(
      async () => {
        const announcement = await this.announcements.findById(id);
        if (!announcement) throw new AnnouncementNotFoundException(id);
        return AnnouncementResponseDto.fromEntity(announcement);
      },
      {
        logger: this.logger,
        notFound: {
          ExceptionClass: AnnouncementNotFoundException,
          warnContext: { msg: 'announcement not found', announcementId: id },
        },
        errorContext: {
          msg: 'findById failed unexpectedly',
          announcementId: id,
        },
      },
    );
  }

  findMany(
    query: ListAnnouncementsQueryDto,
  ): Promise<PaginatedResult<AnnouncementResponseDto>> {
    return withServiceError(
      async () => {
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
      },
      {
        logger: this.logger,
        errorContext: { msg: 'findMany failed unexpectedly', query },
      },
    );
  }

  findManyCursor(
    query: CursorPaginationQueryDto,
  ): Promise<CursorPaginatedResult<AnnouncementResponseDto>> {
    return withServiceError(
      async () => {
        const result = await this.announcements.findManyCursor({
          cursor: query.cursor,
          limit: query.limit,
        });
        return {
          items: result.items.map((announcement) =>
            AnnouncementResponseDto.fromEntity(announcement),
          ),
          nextCursor: result.nextCursor,
          hasMore: result.hasMore,
        };
      },
      {
        logger: this.logger,
        errorContext: { msg: 'findManyCursor failed unexpectedly', query },
      },
    );
  }
}
