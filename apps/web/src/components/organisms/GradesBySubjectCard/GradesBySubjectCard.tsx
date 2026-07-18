import { getTranslations } from "next-intl/server";
import { BarChart } from "@/components/atoms/BarChart";
import type { SubjectAverageDto } from "@/lib/data";

export interface GradesBySubjectCardProps {
  gradesBySubject: SubjectAverageDto[];
  averageGradePercentage: number;
}

export async function GradesBySubjectCard({
  gradesBySubject,
  averageGradePercentage,
}: GradesBySubjectCardProps) {
  const t = await getTranslations("dashboard.overview");

  return (
    <section className="rounded-2xl border border-base-300 bg-base-100 p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-base-content">
          {t("gradesBySubjectTitle")}
        </h2>
        <span className="text-2xl font-extrabold text-primary tabular-nums">
          {averageGradePercentage}%
        </span>
      </div>
      <div className="mt-4">
        <BarChart
          labels={gradesBySubject.map((entry) => entry.subject)}
          values={gradesBySubject.map((entry) => entry.averagePercentage)}
          colorVar="--color-primary"
          maxValue={100}
        />
      </div>
    </section>
  );
}
