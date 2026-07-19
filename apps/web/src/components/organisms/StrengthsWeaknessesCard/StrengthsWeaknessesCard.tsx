"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/molecules/Card";
import { getPerformanceBadgeClass } from "@/lib/analytics/performance-color";
import type { SubjectAverageDto } from "@/lib/data";

export interface StrengthsWeaknessesCardProps {
  strengths: SubjectAverageDto[];
  weaknesses: SubjectAverageDto[];
}

export function StrengthsWeaknessesCard({
  strengths,
  weaknesses,
}: StrengthsWeaknessesCardProps) {
  const t = useTranslations("analytics");

  return (
    <Card>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/60">
            {t("strengthsTitle")}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {strengths.length > 0 ? (
              strengths.map((subject) => (
                <span
                  key={subject.subject}
                  className={`badge gap-1 ${getPerformanceBadgeClass(subject.averagePercentage)}`}
                >
                  {subject.subject}
                  <span className="tabular-nums">
                    {subject.averagePercentage}%
                  </span>
                </span>
              ))
            ) : (
              <p className="text-sm text-base-content/60">
                {t("noStrengths")}
              </p>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/60">
            {t("weaknessesTitle")}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {weaknesses.length > 0 ? (
              weaknesses.map((subject) => (
                <span
                  key={subject.subject}
                  className={`badge gap-1 ${getPerformanceBadgeClass(subject.averagePercentage)}`}
                >
                  {subject.subject}
                  <span className="tabular-nums">
                    {subject.averagePercentage}%
                  </span>
                </span>
              ))
            ) : (
              <p className="text-sm text-base-content/60">
                {t("noWeaknesses")}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
