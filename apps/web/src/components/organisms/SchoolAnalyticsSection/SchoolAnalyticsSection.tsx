"use client";

import { useQuery } from "@tanstack/react-query";
import { AnalyticsPanel } from "@/components/organisms/AnalyticsPanel";
import { ClassesSummaryLinks } from "@/components/organisms/ClassesSummaryLinks";
import type {
  AnalyticsSnapshotDto,
  ClassSummaryDto,
  MonthlyAnalyticsDto,
} from "@/lib/data";

export interface SchoolAnalyticsSectionProps {
  initialAnalytics: AnalyticsSnapshotDto;
  initialMonthly: MonthlyAnalyticsDto[];
  initialClassesSummary: ClassSummaryDto[];
  fetchAnalytics: () => Promise<AnalyticsSnapshotDto | null>;
  fetchMonthly: () => Promise<MonthlyAnalyticsDto[] | null>;
  fetchClassesSummary: () => Promise<ClassSummaryDto[] | null>;
}

/**
 * The client cache layer for the school overview — mirrors StudentsSection's
 * useQuery pattern (initialData seeded from SSR, staleTime matching the
 * server fetch's revalidate window) so revisiting this page within the
 * browser session resolves from the React Query cache instead of a fresh
 * round trip, exactly as already happens for the students list.
 */
export function SchoolAnalyticsSection({
  initialAnalytics,
  initialMonthly,
  initialClassesSummary,
  fetchAnalytics,
  fetchMonthly,
  fetchClassesSummary,
}: SchoolAnalyticsSectionProps) {
  const { data: analytics } = useQuery({
    queryKey: ["schoolAnalytics"],
    queryFn: fetchAnalytics,
    initialData: initialAnalytics,
    staleTime: 30_000,
  });

  const { data: monthly } = useQuery({
    queryKey: ["schoolMonthlyAnalytics"],
    queryFn: fetchMonthly,
    initialData: initialMonthly,
    staleTime: 30_000,
  });

  const { data: classesSummary } = useQuery({
    queryKey: ["classesSummary"],
    queryFn: fetchClassesSummary,
    initialData: initialClassesSummary,
    staleTime: 30_000,
  });

  return (
    <>
      <AnalyticsPanel
        snapshot={analytics ?? initialAnalytics}
        monthly={monthly ?? []}
      />
      <ClassesSummaryLinks classes={classesSummary ?? []} />
    </>
  );
}
