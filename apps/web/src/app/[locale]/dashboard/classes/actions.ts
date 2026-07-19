"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { getClassAnalytics, getClassMonthlyAnalytics } from "@/lib/data";
import type { AnalyticsSnapshotDto, MonthlyAnalyticsDto } from "@/lib/data";

export async function fetchClassAnalyticsAction(
  classId: string,
): Promise<AnalyticsSnapshotDto | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getClassAnalytics(user.accessToken, classId);
}

export async function fetchClassMonthlyAnalyticsAction(
  classId: string,
): Promise<MonthlyAnalyticsDto[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getClassMonthlyAnalytics(user.accessToken, classId);
}
