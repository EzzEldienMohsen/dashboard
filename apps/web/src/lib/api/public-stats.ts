import { cache } from "react";
import type { PublicStats } from "./types";
import { apiFetch } from "./fetcher";

const DEFAULT_STATS: PublicStats = {
  schoolsCount: 0,
  studentsCount: 0,
  teachersCount: 0,
};

export const getPublicStats = cache(async (): Promise<PublicStats> => {
  return (await apiFetch<PublicStats>("/public/stats")) ?? DEFAULT_STATS;
});
