import { afterEach, describe, expect, it, vi } from "vitest";

describe("site config", () => {
  const ORIGINAL_ENV = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    if (ORIGINAL_ENV === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_ENV;
    }
    vi.resetModules();
  });

  it("falls back to http://localhost:3001 when NEXT_PUBLIC_SITE_URL is unset", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    vi.resetModules();
    const { SITE_URL } = await import("./site");
    expect(SITE_URL).toBe("http://localhost:3001");
  });

  it("uses NEXT_PUBLIC_SITE_URL when it is set", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    vi.resetModules();
    const { SITE_URL } = await import("./site");
    expect(SITE_URL).toBe("https://example.com");
  });

  it("falls back to the Vercel production URL when NEXT_PUBLIC_SITE_URL is unset but Vercel's system URL is present", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL = "dashboard-web-bice-tau.vercel.app";
    vi.resetModules();
    const { SITE_URL } = await import("./site");
    expect(SITE_URL).toBe("https://dashboard-web-bice-tau.vercel.app");
    delete process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  });

  it("exposes the expected revalidation and fetch-limit constants", async () => {
    vi.resetModules();
    const { REVALIDATE_SECONDS, ANNOUNCEMENTS_FETCH_LIMIT } = await import("./site");
    expect(REVALIDATE_SECONDS).toBe(3600);
    expect(ANNOUNCEMENTS_FETCH_LIMIT).toBe(100);
  });
});
