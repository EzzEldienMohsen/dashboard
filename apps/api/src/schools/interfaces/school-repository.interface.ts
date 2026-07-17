import type { School } from '../../../generated/prisma/client.js';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

export const SCHOOL_REPOSITORY = Symbol('SCHOOL_REPOSITORY');

/** Exactly the columns SchoolResponseDto exposes — repositories select no more than this. */
export type SchoolEntity = Pick<School, 'id' | 'name' | 'address'>;

export interface FindManySchoolsParams {
  page: number;
  limit: number;
  /** Caller-derived tenant scope — never client-suppliable. */
  schoolId: string;
}

/**
 * Narrow persistence contract for schools — read-only lookups only.
 * Any implementation must resolve `null` for a not-found lookup, never throw.
 */
export interface ISchoolRepository {
  /** `callerSchoolId` is the authenticated caller's own school — never a client-suppliable filter. */
  findById(id: string, callerSchoolId: string): Promise<SchoolEntity | null>;
  findMany(
    params: FindManySchoolsParams,
  ): Promise<PaginatedResult<SchoolEntity>>;
  /** Unscoped by design — used only to validate a schoolId at registration time. */
  existsById(id: string): Promise<boolean>;
}
