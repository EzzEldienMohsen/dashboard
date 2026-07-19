import { getTranslations } from "next-intl/server";
import { FeatureCardGridMotion } from "./FeatureCardGridMotion";

interface FeatureCardGridProps {
  variant: "compact" | "full";
}

const ICONS = ["📚", "🗓️", "📢", "👥", "🏫", "📋"] as const;

// New variants extend this map, never the JSX below (open/closed).
const GRID_VARIANTS = {
  compact: { count: 3, gridClass: "grid-cols-1 md:grid-cols-3" },
  full: { count: 6, gridClass: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" },
} as const satisfies Record<string, { count: number; gridClass: string }>;

export async function FeatureCardGrid({ variant }: FeatureCardGridProps) {
  const t = await getTranslations("features.grid");
  const { count, gridClass } = GRID_VARIANTS[variant];

  const items = Array.from({ length: count }, (_, i) => ({
    title: t(`items.${i}.title`),
    desc: t(`items.${i}.desc`),
    icon: ICONS[i],
  }));

  return (
    <section className="py-16">
      <h2 className="text-2xl font-bold text-base-content mb-8">{t("heading")}</h2>
      <FeatureCardGridMotion items={items} gridClass={gridClass} />
    </section>
  );
}
