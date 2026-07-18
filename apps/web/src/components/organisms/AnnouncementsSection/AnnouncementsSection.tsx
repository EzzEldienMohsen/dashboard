import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { AnnouncementCard } from "@/components/molecules/AnnouncementCard";
import type { PaginatedAnnouncements } from "@/lib/api/types";

interface AnnouncementsSectionProps {
  limit: number;
  /** Injected fetcher — keeps this organism swappable/testable in isolation. */
  fetchAnnouncements: (limit: number) => Promise<PaginatedAnnouncements>;
}

export async function AnnouncementsSection({
  limit,
  fetchAnnouncements,
}: AnnouncementsSectionProps) {
  const [t, tAnnouncements, { items: announcements }] = await Promise.all([
    getTranslations("home.announcements"),
    getTranslations("announcements"),
    fetchAnnouncements(limit),
  ]);

  return (
    <section className="py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-base-content">{t("heading")}</h2>
        <Link href="/announcements" className="link link-primary text-sm font-medium">
          {t("viewAll")}
        </Link>
      </div>
      {announcements.length === 0 ? null : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {announcements.map((a) => (
            <AnnouncementCard
              key={a.id}
              {...a}
              categoryLabel={tAnnouncements(
                `categories.${a.category}`,
              )}
              readMoreLabel={tAnnouncements("readMore")}
            />
          ))}
        </div>
      )}
    </section>
  );
}
