import type { SchoolProfile } from '../../../generated/prisma/client.js';

export const SCHOOL_PROFILE_REPOSITORY = Symbol('SCHOOL_PROFILE_REPOSITORY');

/** Exactly the columns SchoolProfileResponseDto exposes — repositories select no more than this. */
export type SchoolProfileEntity = Pick<
  SchoolProfile,
  | 'id'
  | 'name'
  | 'nameAr'
  | 'mission'
  | 'missionAr'
  | 'foundedYear'
  | 'address'
  | 'contactEmail'
  | 'contactPhone'
  | 'updatedAt'
>;

/**
 * Narrow persistence contract for the school profile singleton — read-only lookup only.
 * Any implementation must resolve `null` when unconfigured, never throw.
 */
export interface ISchoolProfileRepository {
  find(): Promise<SchoolProfileEntity | null>;
}
