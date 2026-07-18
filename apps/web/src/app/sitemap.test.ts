import { describe, expect, it, vi } from "vitest";
import { SITE_URL } from "@/lib/config/site";
import { routing } from "@/i18n/routing";

vi.mock("@/lib/api", () => ({
  getAnnouncements: vi.fn().mockResolvedValue({
    items: [{ id: "a1", publishedAt: "2026-01-01T00:00:00.000Z" }],
    total: 1,
    page: 1,
    limit: 20,
  }),
}));

vi.mock("@/i18n/navigation", () => ({
  getPathname: ({ locale, href }: { locale: string; href: string }) =>
    `/${locale}${href === "/" ? "" : href}`,
}));

import sitemap from "./sitemap";
import { getAnnouncements } from "@/lib/api";

const STATIC_PATHS = ["/", "/features", "/about", "/announcements", "/register", "/login"];

describe("sitemap", () => {
  it("includes every static path once per locale", async () => {
    const result = await sitemap();

    for (const path of STATIC_PATHS) {
      for (const locale of routing.locales) {
        const expectedUrl = `${SITE_URL}/${locale}${path === "/" ? "" : path}`;
        const matches = result.filter((entry) => entry.url === expectedUrl);
        expect(matches).toHaveLength(1);
      }
    }
  });

  it("cross-references both locale URLs in alternates.languages for a static page", async () => {
    const result = await sitemap();

    const enEntry = result.find((entry) => entry.url === `${SITE_URL}/en/features`);
    const arEntry = result.find((entry) => entry.url === `${SITE_URL}/ar/features`);

    expect(enEntry).toBeDefined();
    expect(arEntry).toBeDefined();
    expect(enEntry?.alternates?.languages).toEqual({
      en: `${SITE_URL}/en/features`,
      ar: `${SITE_URL}/ar/features`,
    });
    expect(arEntry?.alternates?.languages).toEqual({
      en: `${SITE_URL}/en/features`,
      ar: `${SITE_URL}/ar/features`,
    });
  });

  it("sets changeFrequency/priority for static pages", async () => {
    const result = await sitemap();

    const home = result.find((entry) => entry.url === `${SITE_URL}/en`);
    expect(home?.changeFrequency).toBe("weekly");
    expect(home?.priority).toBe(1.0);

    const login = result.find((entry) => entry.url === `${SITE_URL}/en/login`);
    expect(login?.changeFrequency).toBe("monthly");
    expect(login?.priority).toBe(0.3);
  });

  it("fetches announcements with the configured limit and includes a detail page per locale", async () => {
    const result = await sitemap();

    expect(getAnnouncements).toHaveBeenCalledWith(100);

    for (const locale of routing.locales) {
      const url = `${SITE_URL}/${locale}/announcements/a1`;
      const entry = result.find((e) => e.url === url);
      expect(entry).toBeDefined();
      expect(entry?.lastModified).toEqual(new Date("2026-01-01T00:00:00.000Z"));
      expect(entry?.changeFrequency).toBe("monthly");
      expect(entry?.priority).toBe(0.5);
    }
  });

  it("cross-references both locale URLs for the announcement detail page", async () => {
    const result = await sitemap();

    const enEntry = result.find((entry) => entry.url === `${SITE_URL}/en/announcements/a1`);
    expect(enEntry?.alternates?.languages).toEqual({
      en: `${SITE_URL}/en/announcements/a1`,
      ar: `${SITE_URL}/ar/announcements/a1`,
    });
  });

  it("returns exactly one entry per static path per locale plus one per announcement per locale", async () => {
    const result = await sitemap();

    expect(result).toHaveLength(STATIC_PATHS.length * routing.locales.length + 1 * routing.locales.length);
  });
});
