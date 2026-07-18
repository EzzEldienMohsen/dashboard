import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, getLocaleDir, LOCALES } from "./locales";

describe("LOCALES", () => {
  it("defines exactly the en and ar locales", () => {
    expect(LOCALES).toEqual([
      { code: "en", label: "English", dir: "ltr" },
      { code: "ar", label: "العربية", dir: "rtl" },
    ]);
  });
});

describe("DEFAULT_LOCALE", () => {
  it("is en", () => {
    expect(DEFAULT_LOCALE).toBe("en");
  });
});

describe("getLocaleDir", () => {
  it("returns ltr for en", () => {
    expect(getLocaleDir("en")).toBe("ltr");
  });

  it("returns rtl for ar", () => {
    expect(getLocaleDir("ar")).toBe("rtl");
  });

  it("falls back to ltr for an unrecognized locale", () => {
    // @ts-expect-error - intentionally testing an invalid locale
    expect(getLocaleDir("fr")).toBe("ltr");
  });
});
