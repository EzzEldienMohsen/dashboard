import { describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  getPathname: ({ locale, href }: { locale: string; href: string }) =>
    `/${locale}${href === "/" ? "" : href}`,
}));

import { buildPageMetadata } from "./metadata";

describe("buildPageMetadata", () => {
  it("builds canonical, hreflang alternates, and openGraph fields for a given locale", () => {
    const metadata = buildPageMetadata({
      title: "About us",
      description: "Learn more about us",
      path: "/about",
      locale: "en",
    });

    expect(metadata.title).toBe("About us");
    expect(metadata.description).toBe("Learn more about us");
    expect(metadata.alternates?.canonical).toBe("/en/about");
    expect(metadata.alternates?.languages).toEqual({
      en: "/en/about",
      ar: "/ar/about",
    });
    expect(metadata.openGraph).toMatchObject({
      title: "About us",
      description: "Learn more about us",
      type: "website",
      url: "/en/about",
    });
  });

  it("localizes the canonical URL and openGraph url per the requested locale", () => {
    const metadata = buildPageMetadata({
      title: "من نحن",
      description: "تعرف علينا",
      path: "/about",
      locale: "ar",
    });

    expect(metadata.alternates?.canonical).toBe("/ar/about");
    expect(metadata.openGraph).toMatchObject({ url: "/ar/about" });
    // languages map is locale-independent — always includes every locale
    expect(metadata.alternates?.languages).toEqual({
      en: "/en/about",
      ar: "/ar/about",
    });
  });

  it("defaults type to website when not provided", () => {
    const metadata = buildPageMetadata({
      title: "Home",
      description: "Welcome",
      path: "/",
      locale: "en",
    });

    expect(metadata.openGraph).toMatchObject({ type: "website" });
    expect(metadata.alternates?.canonical).toBe("/en");
  });

  it("respects an explicit type override", () => {
    const metadata = buildPageMetadata({
      title: "Announcement",
      description: "Something happened",
      path: "/announcements/1",
      locale: "en",
      type: "article",
    });

    expect(metadata.openGraph).toMatchObject({ type: "article" });
  });
});
