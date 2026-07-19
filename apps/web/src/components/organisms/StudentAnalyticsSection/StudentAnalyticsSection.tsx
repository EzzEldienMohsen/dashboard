"use client";

import { useQuery } from "@tanstack/react-query";
import { AnalyticsPanel } from "@/components/organisms/AnalyticsPanel";
import { StrengthsWeaknessesCard } from "@/components/organisms/StrengthsWeaknessesCard";
import { AdviceCard } from "@/components/organisms/AdviceCard";
import type { MonthlyAnalyticsDto, StudentAnalyticsSnapshotDto } from "@/lib/data";

export interface StudentAnalyticsSectionProps {
  studentId: string;
  /** The advice response is backend-localized per request, so it's part of the query key alongside studentId. */
  locale: string;
  attendanceTitle: string;
  initialAnalytics: StudentAnalyticsSnapshotDto;
  initialMonthly: MonthlyAnalyticsDto[];
  fetchAnalytics: (
    studentId: string,
    locale: string,
  ) => Promise<StudentAnalyticsSnapshotDto | null>;
  fetchMonthly: (studentId: string) => Promise<MonthlyAnalyticsDto[] | null>;
}

/**
 * The client cache layer for a student detail page — mirrors
 * ClassAnalyticsSection's pattern, keyed additionally by locale since the
 * advice text is backend-localized per request.
 */
export function StudentAnalyticsSection({
  studentId,
  locale,
  attendanceTitle,
  initialAnalytics,
  initialMonthly,
  fetchAnalytics,
  fetchMonthly,
}: StudentAnalyticsSectionProps) {
  const { data: analytics } = useQuery({
    queryKey: ["studentAnalytics", studentId, locale],
    queryFn: () => fetchAnalytics(studentId, locale),
    initialData: initialAnalytics,
    staleTime: 30_000,
  });

  const { data: monthly } = useQuery({
    queryKey: ["studentMonthlyAnalytics", studentId],
    queryFn: () => fetchMonthly(studentId),
    initialData: initialMonthly,
    staleTime: 30_000,
  });

  const snapshot = analytics ?? initialAnalytics;

  return (
    <>
      <AnalyticsPanel
        snapshot={snapshot}
        monthly={monthly ?? []}
        attendanceTitle={attendanceTitle}
      />
      <StrengthsWeaknessesCard
        strengths={snapshot.strengths}
        weaknesses={snapshot.weaknesses}
      />
      <AdviceCard advice={snapshot.advice} />
    </>
  );
}
