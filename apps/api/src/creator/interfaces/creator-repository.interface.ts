import type { Creator } from '../../../generated/prisma/client.js';

export const CREATOR_REPOSITORY = Symbol('CREATOR_REPOSITORY');

/** Exactly the columns CreatorResponseDto exposes — repositories select no more than this. */
export type CreatorEntity = Pick<
  Creator,
  | 'id'
  | 'name'
  | 'role'
  | 'bio'
  | 'skills'
  | 'email'
  | 'githubUrl'
  | 'linkedinUrl'
  | 'portfolioUrl'
  | 'updatedAt'
>;

/**
 * Narrow persistence contract for the creator-credit singleton — read-only lookup only.
 * Any implementation must resolve `null` when unconfigured, never throw.
 */
export interface ICreatorRepository {
  find(): Promise<CreatorEntity | null>;
}
