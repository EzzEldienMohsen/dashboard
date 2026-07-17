import { getTranslations } from "next-intl/server";
import { StatCard } from "@/components/molecules/StatCard";

interface StatsSectionProps {
  schoolsCount: number;
  studentsCount: number;
  teachersCount: number;
}

export async function StatsSection({
  schoolsCount,
  studentsCount,
  teachersCount,
}: StatsSectionProps) {
  const t = await getTranslations("stats");

  return (
    <section className="py-16">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard count={schoolsCount} label={t("schools")} />
        <StatCard count={studentsCount} label={t("students")} />
        <StatCard count={teachersCount} label={t("teachers")} />
      </div>
    </section>
  );
}
