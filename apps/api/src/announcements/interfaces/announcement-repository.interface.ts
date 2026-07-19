import type { Announcement, $Enums } from '../../../generated/prisma/client.js';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import type { CursorPaginatedResult } from '../../common/interfaces/cursor-paginated-result.interface';

export const ANNOUNCEMENT_REPOSITORY = Symbol('ANNOUNCEMENT_REPOSITORY');

/** Exactly the columns AnnouncementResponseDto exposes — repositories select no more than this. */
export type AnnouncementEntity = Pick<
  Announcement,
  'id' | 'title' | 'titleAr' | 'body' | 'bodyAr' | 'category' | 'publishedAt'
>;

export interface FindManyAnnouncementsParams {
  page: number;
  limit: number;
  category?: $Enums.AnnouncementCategory;
}

/**
 * Narrow persistence contract for announcements — read-only lookups only.
 * Any implementation must resolve `null` for a not-found lookup, never throw.
 */
export interface IAnnouncementRepository {
  findById(id: string): Promise<AnnouncementEntity | null>;
  findMany(
    params: FindManyAnnouncementsParams,
  ): Promise<PaginatedResult<AnnouncementEntity>>;
  findManyCursor(params: {
    cursor?: string;
    limit: number;
    category?: $Enums.AnnouncementCategory;
  }): Promise<CursorPaginatedResult<AnnouncementEntity>>;
}
