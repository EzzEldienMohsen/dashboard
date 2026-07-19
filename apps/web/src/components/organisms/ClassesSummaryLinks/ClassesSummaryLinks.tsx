"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/molecules/Card";
import { Link } from "@/i18n/navigation";
import { getPerformanceBadgeClass } from "@/lib/analytics/performance-color";
import type { ClassSummaryDto } from "@/lib/data";

export interface ClassesSummaryLinksProps {
  classes: ClassSummaryDto[];
}

/**
 * One batched fetch (`getClassesSummary`) backs every link here — no N+1 of
 * one analytics call per class. Badge color is driven by
 * `getPerformanceTier` so high/low performing classes are visually obvious
 * before a manager ever clicks through.
 */
export function ClassesSummaryLinks({ classes }: ClassesSummaryLinksProps) {
  const t = useTranslations("analytics");

  if (classes.length === 0) return null;

  return (
    <Card title={t("classesTitle")}>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((klass) => (
          <li key={klass.classId}>
            <Link
              href={`/dashboard/classes/${klass.classId}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-base-300 p-4 transition hover:border-primary"
            >
              <span className="font-medium text-base-content">
                {klass.className}
              </span>
              <span
                className={`badge ${getPerformanceBadgeClass(klass.averageGradePercentage)}`}
              >
                {klass.averageGradePercentage}%
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
