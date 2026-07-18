import { describe, expect, it } from "vitest";
import robots from "./robots";
import { SITE_URL } from "@/lib/config/site";
import { routing } from "@/i18n/routing";

describe("robots", () => {
  it("disallows the dashboard path for every locale plus /api", () => {
    const result = robots();
    const rules = result.rules as { userAgent: string; allow: string; disallow: string[] }[];
    const rule = rules[0];

    for (const locale of routing.locales) {
      expect(rule.disallow).toContain(`/${locale}/dashboard`);
    }
    expect(rule.disallow).toContain("/api");
  });

  it("allows everything else and targets the wildcard user agent", () => {
    const result = robots();
    const rules = result.rules as { userAgent: string; allow: string }[];
    const rule = rules[0];

    expect(rule.userAgent).toBe("*");
    expect(rule.allow).toBe("/");
  });

  it("points the sitemap at SITE_URL/sitemap.xml", () => {
    const result = robots();

    expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });

  it("produces exactly one disallow entry per locale plus /api", () => {
    const result = robots();
    const rules = result.rules as { disallow: string[] }[];
    const rule = rules[0];

    expect(rule.disallow).toHaveLength(routing.locales.length + 1);
  });
});
