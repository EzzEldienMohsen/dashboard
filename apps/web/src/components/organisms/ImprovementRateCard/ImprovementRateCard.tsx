"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/molecules/Card";

export interface ImprovementRateCardProps {
  improvementRatePercentage: number;
}

export function ImprovementRateCard({
  improvementRatePercentage,
}: ImprovementRateCardProps) {
  const t = useTranslations("analytics");

  const isUp = improvementRatePercentage > 0;
  const isDown = improvementRatePercentage < 0;
  const magnitude = Math.abs(improvementRatePercentage);
  const colorClass = isUp
    ? "text-success"
    : isDown
      ? "text-error"
      : "text-base-content/60";
  const description = isUp
    ? t("improvementRateUp", { value: magnitude })
    : isDown
      ? t("improvementRateDown", { value: magnitude })
      : t("improvementRateFlat");

  return (
    <Card title={t("improvementRateTitle")} className="text-center">
      <div
        className={`mt-4 flex items-center justify-center gap-2 text-4xl font-extrabold tabular-nums ${colorClass}`}
      >
        <span aria-hidden="true">{isUp ? "↑" : isDown ? "↓" : "→"}</span>
        <span>{magnitude}%</span>
      </div>
      <p className="mt-2 text-sm text-base-content/60">{description}</p>
    </Card>
  );
}
