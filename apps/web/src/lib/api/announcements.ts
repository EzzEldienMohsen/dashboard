import { cache } from "react";
import type { Announcement, PaginatedAnnouncements } from "./types";
import { apiFetch } from "./fetcher";
import { isArabicLocale, pickArabic } from "./localize-content";

const EMPTY_PAGE: PaginatedAnnouncements = { items: [], total: 0, page: 1, limit: 20 };

function localizeAnnouncement(announcement: Announcement): Announcement {
  return {
    ...announcement,
    title: pickArabic(announcement.title, announcement.titleAr),
    body: pickArabic(announcement.body, announcement.bodyAr),
  };
}

export const getAnnouncements = cache(async (limit = 20): Promise<PaginatedAnnouncements> => {
  const page =
    (await apiFetch<PaginatedAnnouncements>(`/announcements?limit=${limit}`)) ?? EMPTY_PAGE;

  if (await isArabicLocale()) {
    return { ...page, items: page.items.map(localizeAnnouncement) };
  }

  return page;
});

export const getAnnouncementById = cache(async (id: string): Promise<Announcement | null> => {
  const announcement = await apiFetch<Announcement>(`/announcements/${id}`);
  if (!announcement) return null;

  return (await isArabicLocale()) ? localizeAnnouncement(announcement) : announcement;
});
