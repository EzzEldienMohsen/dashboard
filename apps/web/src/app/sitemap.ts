import type { MetadataRoute } from "next";
import { getAnnouncements } from "@/lib/api";
import { SITE_URL, ANNOUNCEMENTS_FETCH_LIMIT } from "@/lib/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                            changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/features`,              changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/about`,                 changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/announcements`,         changeFrequency: "weekly",  priority: 0.6 },
    { url: `${SITE_URL}/register`,              changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/login`,                 changeFrequency: "monthly", priority: 0.3 },
  ];

  const { items } = await getAnnouncements(ANNOUNCEMENTS_FETCH_LIMIT);
  const announcementPages: MetadataRoute.Sitemap = items.map((a) => ({
    url: `${SITE_URL}/announcements/${a.id}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...announcementPages];
}
