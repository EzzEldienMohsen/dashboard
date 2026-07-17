export interface CursorPaginatedResult<T> {
  items: T[];
  nextCursor: string | null; // null when no more pages
  hasMore: boolean;
}
