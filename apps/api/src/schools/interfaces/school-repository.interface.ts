import type { School } from '../../../generated/prisma/client.js';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

export const SCHOOL_REPOSITORY = Symbol('SCHOOL_REPOSITORY');

/** Exactly the columns SchoolResponseDto exposes — repositories select no more than this. */
export type SchoolEntity = Pick<School, 'id' | 'name' | 'address'>;

export interface FindManySchoolsParams {
  page: number;
  limit: number;
}

/**
 * Narrow persistence contract for schools — read-only lookups only.
 * Any implementation must resolve `null` for a not-found lookup, never throw.
 */
export interface ISchoolRepository {
  findById(id: string): Promise<SchoolEntity | null>;
  findMany(
    params: FindManySchoolsParams,
  ): Promise<PaginatedResult<SchoolEntity>>;
}
