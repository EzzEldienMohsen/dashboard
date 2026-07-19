"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Card } from "@/components/molecules/Card";
import { LineChart } from "@/components/atoms/LineChart";
import type { MonthlyAnalyticsDto } from "@/lib/data";

export interface PerformanceTrendCardProps {
  monthly: MonthlyAnalyticsDto[];
}

function parseMonth(month: string): Date {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthNumber - 1, 1));
}

export function PerformanceTrendCard({ monthly }: PerformanceTrendCardProps) {
  const t = useTranslations("analytics");
  const format = useFormatter();

  const labels = monthly.map((entry) =>
    format.dateTime(parseMonth(entry.month), { month: "short" }),
  );

  return (
    <Card title={t("trendTitle")}>
      <div className="mt-4">
        <LineChart
          labels={labels}
          datasets={[
            {
              label: t("trendGradeLabel"),
              values: monthly.map((entry) => entry.averageGradePercentage),
              colorVar: "--color-primary",
            },
            {
              label: t("trendAttendanceLabel"),
              values: monthly.map((entry) => entry.attendanceRatePercentage),
              colorVar: "--color-info",
            },
          ]}
        />
      </div>
    </Card>
  );
}
