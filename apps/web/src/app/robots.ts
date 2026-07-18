import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config/site";
import { routing } from "@/i18n/routing";

export default function robots(): MetadataRoute.Robots {
  const disallow = routing.locales.map((locale) => `/${locale}/dashboard`);
  disallow.push("/api");

  return {
    rules: [{ userAgent: "*", allow: "/", disallow }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
