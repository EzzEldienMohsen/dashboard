export const PUBLIC_STATS_REPOSITORY = Symbol('PUBLIC_STATS_REPOSITORY');

export interface PublicStatsCounts {
  schoolsCount: number;
  studentsCount: number;
  teachersCount: number;
}

/** Narrow persistence contract for the public stats widget — read-only lookups only. */
export interface IPublicStatsRepository {
  getCounts(): Promise<PublicStatsCounts>;
}
