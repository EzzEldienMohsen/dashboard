"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/molecules/Card";
import { BarChart } from "@/components/atoms/BarChart";
import type { SubjectAverageDto } from "@/lib/data";

export interface GradesBySubjectCardProps {
  gradesBySubject: SubjectAverageDto[];
  averageGradePercentage: number;
}

export function GradesBySubjectCard({
  gradesBySubject,
  averageGradePercentage,
}: GradesBySubjectCardProps) {
  const t = useTranslations("dashboard.overview");

  return (
    <Card
      title={t("gradesBySubjectTitle")}
      action={
        <span className="text-2xl font-extrabold text-primary tabular-nums">
          {averageGradePercentage}%
        </span>
      }
    >
      <div className="mt-4">
        <BarChart
          labels={gradesBySubject.map((entry) => entry.subject)}
          values={gradesBySubject.map((entry) => entry.averagePercentage)}
          colorVar="--color-primary"
          maxValue={100}
        />
      </div>
    </Card>
  );
}
