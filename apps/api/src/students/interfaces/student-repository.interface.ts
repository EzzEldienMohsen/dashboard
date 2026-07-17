import type { Student } from '../../../generated/prisma/client.js';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

export const STUDENT_REPOSITORY = Symbol('STUDENT_REPOSITORY');

/** Exactly the columns StudentResponseDto exposes — repositories select no more than this. */
export type StudentEntity = Pick<
  Student,
  'id' | 'firstName' | 'lastName' | 'classId'
>;

export interface FindManyStudentsParams {
  page: number;
  limit: number;
  /** Caller-derived tenant scope — never client-suppliable. */
  schoolId: string;
  classId?: string;
}

/**
 * Narrow persistence contract for students — read-only lookups only.
 * Any implementation must resolve `null` for a not-found lookup, never throw.
 */
export interface IStudentRepository {
  /** `schoolId` is the authenticated caller's own school — never a client-suppliable filter. */
  findById(id: string, schoolId: string): Promise<StudentEntity | null>;
  findMany(
    params: FindManyStudentsParams,
  ): Promise<PaginatedResult<StudentEntity>>;
}
