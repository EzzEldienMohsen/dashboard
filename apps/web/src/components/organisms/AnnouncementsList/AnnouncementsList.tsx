"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AnnouncementCard } from "@/components/molecules/AnnouncementCard";
import type { Announcement } from "@/lib/api/types";
import { CATEGORY_BADGE_CLASS } from "@/lib/announcements/category";

interface AnnouncementsListProps {
  announcements: Announcement[];
}

const CATEGORIES = ["ALL", ...Object.keys(CATEGORY_BADGE_CLASS)] as const;

export function AnnouncementsList({ announcements }: AnnouncementsListProps) {
  const t = useTranslations("announcements");
  const [active, setActive] = useState<string>("ALL");

  const filtered = useMemo(
    () => (active === "ALL" ? announcements : announcements.filter((a) => a.category === active)),
    [active, announcements],
  );

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
            {t(`categories.${cat}`)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-base-content/50 py-12">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a) => (
            <AnnouncementCard
              key={a.id}
              {...a}
              categoryLabel={t(`categories.${a.category}`)}
              readMoreLabel={t("readMore")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
