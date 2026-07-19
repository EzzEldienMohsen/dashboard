"use server";

import { getCurrentUser } from "@/lib/auth/session";
import {
  getSchoolAnalytics,
  getSchoolMonthlyAnalytics,
  getClassesSummary,
} from "@/lib/data";
import type {
  AnalyticsSnapshotDto,
  ClassSummaryDto,
  MonthlyAnalyticsDto,
} from "@/lib/data";

export async function fetchSchoolAnalyticsAction(): Promise<AnalyticsSnapshotDto | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getSchoolAnalytics(user.accessToken, user.schoolId);
}

export async function fetchSchoolMonthlyAnalyticsAction(): Promise<
  MonthlyAnalyticsDto[] | null
> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getSchoolMonthlyAnalytics(user.accessToken, user.schoolId);
}

export async function fetchClassesSummaryAction(): Promise<
  ClassSummaryDto[] | null
> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getClassesSummary(user.accessToken, user.schoolId);
}
