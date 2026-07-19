"use client";

import { useQuery } from "@tanstack/react-query";
import { AnalyticsPanel } from "@/components/organisms/AnalyticsPanel";
import type { AnalyticsSnapshotDto, MonthlyAnalyticsDto } from "@/lib/data";

export interface ClassAnalyticsSectionProps {
  classId: string;
  initialAnalytics: AnalyticsSnapshotDto;
  initialMonthly: MonthlyAnalyticsDto[];
  fetchAnalytics: (classId: string) => Promise<AnalyticsSnapshotDto | null>;
  fetchMonthly: (classId: string) => Promise<MonthlyAnalyticsDto[] | null>;
}

/**
 * The client cache layer for a class detail page — queries are keyed by
 * `classId` so switching between class tabs (real navigations) gets
 * independent cache entries; revisiting a class already seen this session
 * resolves from the React Query cache within `staleTime`.
 */
export function ClassAnalyticsSection({
  classId,
  initialAnalytics,
  initialMonthly,
  fetchAnalytics,
  fetchMonthly,
}: ClassAnalyticsSectionProps) {
  const { data: analytics } = useQuery({
    queryKey: ["classAnalytics", classId],
    queryFn: () => fetchAnalytics(classId),
    initialData: initialAnalytics,
    staleTime: 30_000,
  });

  const { data: monthly } = useQuery({
    queryKey: ["classMonthlyAnalytics", classId],
    queryFn: () => fetchMonthly(classId),
    initialData: initialMonthly,
    staleTime: 30_000,
  });

  return (
    <AnalyticsPanel
      snapshot={analytics ?? initialAnalytics}
      monthly={monthly ?? []}
    />
  );
}
