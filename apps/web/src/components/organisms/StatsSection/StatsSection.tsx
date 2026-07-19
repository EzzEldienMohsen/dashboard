import { getTranslations } from "next-intl/server";
import { getPublicStats } from "@/lib/api";
import { StatsSectionMotion } from "./StatsSectionMotion";

export async function StatsSection() {
  const [t, { schoolsCount, studentsCount, teachersCount }] = await Promise.all([
    getTranslations("stats"),
    getPublicStats(),
  ]);

  return (
    <section className="py-16">
      <h2 className="sr-only">{t("heading")}</h2>
      <StatsSectionMotion
        items={[
          { count: schoolsCount, label: t("schools") },
          { count: studentsCount, label: t("students") },
          { count: teachersCount, label: t("teachers") },
        ]}
      />
    </section>
  );
}
