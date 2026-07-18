import { getTranslations } from "next-intl/server";
import { DoughnutChart } from "@/components/atoms/DoughnutChart";
import type { AttendanceBreakdownDto } from "@/lib/data";

export interface AttendanceBreakdownCardProps {
  breakdown: AttendanceBreakdownDto;
  attendanceRatePercentage: number;
}

const STATUS_COLOR_VARS = [
  "--color-success", // present
  "--color-error", // absent
  "--color-warning", // late
  "--color-info", // excused
];

export async function AttendanceBreakdownCard({
  breakdown,
  attendanceRatePercentage,
}: AttendanceBreakdownCardProps) {
  const t = await getTranslations("dashboard.overview");

  return (
    <section className="rounded-2xl border border-base-300 bg-base-100 p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-base-content">
          {t("attendanceBreakdownTitle")}
        </h2>
        <span className="text-2xl font-extrabold text-primary tabular-nums">
          {attendanceRatePercentage}%
        </span>
      </div>
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
    </section>
  );
}
