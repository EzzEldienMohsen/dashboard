import type { CursorPaginatedResult } from '../interfaces/cursor-paginated-result.interface';

export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
}

export async function paginateCursor<T extends { id: string }>(
  params: CursorPaginationParams,
  findMany: (args: {
    take: number;
    skip: number;
    cursor?: { id: string };
  }) => Promise<T[]>,
): Promise<CursorPaginatedResult<T>> {
  const { cursor, limit } = params;
  const items = await findMany({
    take: limit + 1, // fetch one extra to determine hasMore
    skip: cursor ? 1 : 0, // skip the cursor item itself
    cursor: cursor ? { id: cursor } : undefined,
  });

  const hasMore = items.length > limit;
  if (hasMore) items.pop(); // remove the extra item

  return {
    items,
    nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
    hasMore,
  };
}
