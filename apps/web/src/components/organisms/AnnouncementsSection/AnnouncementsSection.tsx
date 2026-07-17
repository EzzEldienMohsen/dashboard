import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AnnouncementCard } from "@/components/molecules/AnnouncementCard";

interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  publishedAt: string;
}

interface AnnouncementsSectionProps {
  announcements: Announcement[];
}

export async function AnnouncementsSection({ announcements }: AnnouncementsSectionProps) {
  const t = await getTranslations("home.announcements");

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
            <AnnouncementCard key={a.id} {...a} />
          ))}
        </div>
      )}
    </section>
  );
}
