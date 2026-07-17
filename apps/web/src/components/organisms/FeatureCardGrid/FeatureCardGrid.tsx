import { getTranslations } from "next-intl/server";

interface FeatureCardGridProps {
  variant: "compact" | "full";
}

const ICONS = ["📚", "🗓️", "📢", "👥", "🏫", "📋"] as const;

export async function FeatureCardGrid({ variant }: FeatureCardGridProps) {
  const t = await getTranslations("features.grid");

  const allItems = Array.from({ length: 6 }, (_, i) => ({
    title: t(`items.${i}.title` as Parameters<typeof t>[0]),
    desc: t(`items.${i}.desc` as Parameters<typeof t>[0]),
    icon: ICONS[i],
  }));

  const items = variant === "compact" ? allItems.slice(0, 3) : allItems;

  return (
    <section className="py-16">
      <h2 className="text-2xl font-bold text-base-content mb-8">{t("heading")}</h2>
      <div
        className={`grid gap-6 ${
          variant === "compact"
            ? "grid-cols-1 md:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-base-300 bg-base-100 p-6 flex flex-col gap-3 hover:shadow-md transition-shadow"
          >
            <span className="text-3xl" aria-hidden="true">
              {item.icon}
            </span>
            <h3 className="font-semibold text-base-content">{item.title}</h3>
            <p className="text-sm text-base-content/60 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
