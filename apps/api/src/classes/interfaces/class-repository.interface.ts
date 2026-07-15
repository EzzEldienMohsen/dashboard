import type { Class } from '../../../generated/prisma/client.js';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

export const CLASS_REPOSITORY = Symbol('CLASS_REPOSITORY');

/** Exactly the columns ClassResponseDto exposes — repositories select no more than this. */
export type ClassEntity = Pick<Class, 'id' | 'name' | 'schoolId'>;

export interface FindManyClassesParams {
  page: number;
  limit: number;
  schoolId?: string;
}

/**
 * Narrow persistence contract for classes — read-only lookups only.
 * Any implementation must resolve `null` for a not-found lookup, never throw.
 */
export interface IClassRepository {
  findById(id: string): Promise<ClassEntity | null>;
  findMany(
    params: FindManyClassesParams,
  ): Promise<PaginatedResult<ClassEntity>>;
}
