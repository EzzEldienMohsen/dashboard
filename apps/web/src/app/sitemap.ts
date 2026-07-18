import type { MetadataRoute } from "next";
import { getAnnouncements } from "@/lib/api";
import { SITE_URL, ANNOUNCEMENTS_FETCH_LIMIT } from "@/lib/config/site";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const STATIC_PATHS: {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/features", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/announcements", changeFrequency: "weekly", priority: 0.6 },
  { path: "/register", changeFrequency: "monthly", priority: 0.5 },
  { path: "/login", changeFrequency: "monthly", priority: 0.3 },
];

/** One sitemap entry per locale for a given path, each cross-referencing its siblings for hreflang. */
function localizedEntries(
  path: string,
  extra: Partial<MetadataRoute.Sitemap[number]>,
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, `${SITE_URL}${getPathname({ locale, href: path })}`]),
  );

  return routing.locales.map((locale) => ({
    url: `${SITE_URL}${getPathname({ locale, href: path })}`,
    alternates: { languages },
    ...extra,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = STATIC_PATHS.flatMap(({ path, changeFrequency, priority }) =>
    localizedEntries(path, { changeFrequency, priority }),
  );

  const { items } = await getAnnouncements(ANNOUNCEMENTS_FETCH_LIMIT);
  const announcementPages = items.flatMap((a) =>
    localizedEntries(`/announcements/${a.id}`, {
      lastModified: new Date(a.publishedAt),
      changeFrequency: "monthly",
      priority: 0.5,
    }),
  );

  return [...staticPages, ...announcementPages];
}
