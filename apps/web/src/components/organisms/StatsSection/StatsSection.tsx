import { getTranslations } from "next-intl/server";
import { StatCard } from "@/components/molecules/StatCard";
import { getPublicStats } from "@/lib/api";

export async function StatsSection() {
  const [t, { schoolsCount, studentsCount, teachersCount }] = await Promise.all([
    getTranslations("stats"),
    getPublicStats(),
  ]);

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
