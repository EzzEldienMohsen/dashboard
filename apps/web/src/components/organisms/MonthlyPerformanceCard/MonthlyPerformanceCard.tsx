"use client";

import { useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import * as Sentry from "@sentry/nextjs";
import { Card } from "@/components/molecules/Card";
import { Select } from "@/components/atoms/Select";
import { Label } from "@/components/atoms/Label";
import { RadialProgress } from "@/components/atoms/RadialProgress";
import { getPerformanceTextColorClass } from "@/lib/analytics/performance-color";
import type { MonthlyAnalyticsDto } from "@/lib/data";

export interface MonthlyPerformanceCardProps {
  monthly: MonthlyAnalyticsDto[];
}

function parseMonth(month: string): Date {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthNumber - 1, 1));
}

/**
 * Fetches the monthly window once (passed down from the server) and lets
 * the dropdown only switch which already-loaded month is displayed — no
 * refetch per selection.
 */
export function MonthlyPerformanceCard({ monthly }: MonthlyPerformanceCardProps) {
  const t = useTranslations("analytics");
  const format = useFormatter();
  const [selectedIndex, setSelectedIndex] = useState(
    Math.max(monthly.length - 1, 0),
  );

  const options = useMemo(
    () =>
      monthly.map((entry, index) => ({
        value: String(index),
        label: format.dateTime(parseMonth(entry.month), {
          year: "numeric",
          month: "long",
        }),
      })),
    [monthly, format],
  );

  if (monthly.length === 0) return null;

  const selected = monthly[selectedIndex];

  return (
    <Card title={t("monthlyPerformanceTitle")}>
      <div className="mt-3 max-w-xs">
        <Label htmlFor="monthly-performance-month">{t("selectMonth")}</Label>
        <Select
          id="monthly-performance-month"
          name="monthly-performance-month"
          value={String(selectedIndex)}
          options={options}
          onChange={(event) => {
            const index = Number(event.target.value);
            setSelectedIndex(index);
            Sentry.addBreadcrumb({
              category: "ui.interaction",
              message: "month-performance-dropdown-changed",
              data: { month: monthly[index]?.month },
            });
          }}
        />
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <RadialProgress
            value={selected.averageGradePercentage}
            colorClassName={getPerformanceTextColorClass(
              selected.averageGradePercentage,
            )}
          />
          <span className="text-sm text-base-content/60">
            {t("trendGradeLabel")}
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <RadialProgress
            value={selected.attendanceRatePercentage}
            colorClassName={getPerformanceTextColorClass(
              selected.attendanceRatePercentage,
            )}
          />
          <span className="text-sm text-base-content/60">
            {t("commitmentTitle")}
          </span>
        </div>
      </div>
    </Card>
  );
}
