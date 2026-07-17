"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { getCategoryBadgeClass } from "@/lib/announcements/category";

interface AnnouncementCardProps {
  id: string;
  title: string;
  body: string;
  category: string;
  publishedAt: string;
}

export function AnnouncementCard({
  id,
  title,
  body,
  category,
  publishedAt,
}: AnnouncementCardProps) {
  const t = useTranslations("announcements");
  const badgeClass = getCategoryBadgeClass(category);
  const snippet = body.length > 140 ? body.slice(0, 140).trimEnd() + "…" : body;
  const date = new Date(publishedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="card-title text-base leading-snug">{title}</h3>
          <span className={`badge badge-sm shrink-0 ${badgeClass}`}>
            {t(`categories.${category}` as Parameters<typeof t>[0])}
          </span>
        </div>
        <p className="text-sm text-base-content/70 leading-relaxed">{snippet}</p>
        <div className="card-actions items-center justify-between mt-1">
          <time className="text-xs text-base-content/50">{date}</time>
          <Link href={`/announcements/${id}`} className="link link-primary text-sm font-medium">
            {t("readMore")}
          </Link>
        </div>
      </div>
    </div>
  );
}
