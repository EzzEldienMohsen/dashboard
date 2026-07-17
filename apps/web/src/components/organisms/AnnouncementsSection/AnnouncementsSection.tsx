import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AnnouncementCard } from "@/components/molecules/AnnouncementCard";
import { getAnnouncements } from "@/lib/api";

interface AnnouncementsSectionProps {
  limit: number;
}

export async function AnnouncementsSection({ limit }: AnnouncementsSectionProps) {
  const [t, tAnnouncements, { items: announcements }] = await Promise.all([
    getTranslations("home.announcements"),
    getTranslations("announcements"),
    getAnnouncements(limit),
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
                `categories.${a.category}` as Parameters<typeof tAnnouncements>[0],
              )}
              readMoreLabel={tAnnouncements("readMore")}
            />
          ))}
        </div>
      )}
    </section>
  );
}
