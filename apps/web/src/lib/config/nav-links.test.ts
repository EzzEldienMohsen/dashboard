import { describe, expect, it } from "vitest";
import { FOOTER_LINKS, NAV_LINKS } from "./nav-links";

describe("NAV_LINKS", () => {
  it("contains the primary marketing nav entries in order", () => {
    expect(NAV_LINKS).toEqual([
      { href: "/", labelKey: "home" },
      { href: "/features", labelKey: "features" },
      { href: "/about", labelKey: "about" },
      { href: "/announcements", labelKey: "announcements" },
    ]);
  });
});

describe("FOOTER_LINKS", () => {
  it("contains the footer nav entries in order", () => {
    expect(FOOTER_LINKS).toEqual([
      { href: "/", labelKey: "links.home" },
      { href: "/features", labelKey: "links.features" },
      { href: "/about", labelKey: "links.about" },
      { href: "/announcements", labelKey: "links.announcements" },
      { href: "/login", labelKey: "links.login" },
      { href: "/register", labelKey: "links.register" },
    ]);
  });

  it("has a unique href per entry", () => {
    const hrefs = FOOTER_LINKS.map((link) => link.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
