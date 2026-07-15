import type { PaginatedResult } from '../interfaces/paginated-result.interface';

export interface PaginationParams {
  page: number;
  limit: number;
}

interface Page {
  skip: number;
  take: number;
}

/**
 * Shared skip/take + count-in-parallel shape used by every read-only Prisma repository.
 * Callers supply their own findMany/count closures (already bound to a `where`/`select`)
 * so this stays agnostic of any particular Prisma model's generated argument types.
 */
export async function paginate<T>(
  params: PaginationParams,
  findMany: (page: Page) => Promise<T[]>,
  count: () => Promise<number>,
): Promise<PaginatedResult<T>> {
  const { page, limit } = params;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    findMany({ skip, take: limit }),
    count(),
  ]);

  return { items, total, page, limit };
}
