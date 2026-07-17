"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnnouncementCard } from "@/components/molecules/AnnouncementCard";

interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  publishedAt: string;
}

interface AnnouncementsListProps {
  announcements: Announcement[];
}

const CATEGORIES = ["ALL", "GENERAL", "EVENT", "EXAM", "HOLIDAY", "URGENT"] as const;

export function AnnouncementsList({ announcements }: AnnouncementsListProps) {
  const t = useTranslations("announcements");
  const [active, setActive] = useState<string>("ALL");

  const filtered =
    active === "ALL" ? announcements : announcements.filter((a) => a.category === active);

  return (
    <div>
      {/* Category filter tabs */}
      <div
        role="tablist"
        className="flex flex-wrap gap-2 mb-8"
        aria-label="Filter by category"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={active === cat}
            className={`btn btn-sm ${active === cat ? "btn-primary" : "btn-ghost border border-base-300"}`}
            onClick={() => setActive(cat)}
          >
            {t(`categories.${cat}` as Parameters<typeof t>[0])}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-base-content/50 py-12">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a) => (
            <AnnouncementCard key={a.id} {...a} />
          ))}
        </div>
      )}
    </div>
  );
}
