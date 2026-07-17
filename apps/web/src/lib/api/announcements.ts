import { cache } from "react";
import type { Announcement, PaginatedAnnouncements } from "./types";
import { apiFetch } from "./fetcher";

const EMPTY_PAGE: PaginatedAnnouncements = { items: [], total: 0, page: 1, limit: 20 };

export const getAnnouncements = cache(async (limit = 20): Promise<PaginatedAnnouncements> => {
  return (await apiFetch<PaginatedAnnouncements>(`/announcements?limit=${limit}`)) ?? EMPTY_PAGE;
});

export const getAnnouncementById = cache(async (id: string): Promise<Announcement | null> => {
  return apiFetch<Announcement>(`/announcements/${id}`);
});
