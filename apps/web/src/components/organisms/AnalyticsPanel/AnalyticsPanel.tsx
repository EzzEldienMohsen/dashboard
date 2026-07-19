import { AttendanceBreakdownCard } from "@/components/organisms/AttendanceBreakdownCard";
import { GradesBySubjectCard } from "@/components/organisms/GradesBySubjectCard";
import { MonthlyPerformanceCard } from "@/components/organisms/MonthlyPerformanceCard";
import { PerformanceTrendCard } from "@/components/organisms/PerformanceTrendCard";
import { ImprovementRateCard } from "@/components/organisms/ImprovementRateCard";
import type { AnalyticsSnapshotDto, MonthlyAnalyticsDto } from "@/lib/data";

export interface AnalyticsPanelProps {
  snapshot: AnalyticsSnapshotDto;
  monthly: MonthlyAnalyticsDto[];
  /** Overrides the attendance card's title — e.g. "Commitment" on the student page. */
  attendanceTitle?: string;
}

/**
 * The five-card analytics suite (attendance/commitment, grades by subject,
 * monthly performance gauge + dropdown, trend line, improvement rate)
 * reused verbatim across the school overview, class detail, and student
 * detail pages — one composition, parameterized by scope.
 */
export function AnalyticsPanel({
  snapshot,
  monthly,
  attendanceTitle,
}: AnalyticsPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AttendanceBreakdownCard
          breakdown={snapshot.attendanceBreakdown}
          attendanceRatePercentage={snapshot.attendanceRatePercentage}
          title={attendanceTitle}
        />
        <GradesBySubjectCard
          gradesBySubject={snapshot.gradesBySubject}
          averageGradePercentage={snapshot.averageGradePercentage}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlyPerformanceCard monthly={monthly} />
        <PerformanceTrendCard monthly={monthly} />
      </div>
      <ImprovementRateCard
        improvementRatePercentage={snapshot.improvementRatePercentage}
      />
    </div>
  );
}
