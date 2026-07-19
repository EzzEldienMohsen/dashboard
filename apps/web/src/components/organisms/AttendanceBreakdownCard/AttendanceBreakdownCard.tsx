"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/molecules/Card";
import { DoughnutChart } from "@/components/atoms/DoughnutChart";
import type { AttendanceBreakdownDto } from "@/lib/data";

export interface AttendanceBreakdownCardProps {
  breakdown: AttendanceBreakdownDto;
  attendanceRatePercentage: number;
  /** Overrides the default title — used to relabel this as "Commitment" on the student page. */
  title?: string;
}

const STATUS_COLOR_VARS = [
  "--color-success", // present
  "--color-error", // absent
  "--color-warning", // late
  "--color-info", // excused
];

export function AttendanceBreakdownCard({
  breakdown,
  attendanceRatePercentage,
  title,
}: AttendanceBreakdownCardProps) {
  const t = useTranslations("dashboard.overview");

  return (
    <Card
      title={title ?? t("attendanceBreakdownTitle")}
      action={
        <span className="text-2xl font-extrabold text-primary tabular-nums">
          {attendanceRatePercentage}%
        </span>
      }
    >
      <div className="mt-4 max-w-xs mx-auto">
        <DoughnutChart
          labels={[t("present"), t("absent"), t("late"), t("excused")]}
          values={[
            breakdown.present,
            breakdown.absent,
            breakdown.late,
            breakdown.excused,
          ]}
          colorVars={STATUS_COLOR_VARS}
        />
      </div>
    </Card>
  );
}
