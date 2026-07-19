import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Announcement, PaginatedAnnouncements } from "./types";
import type { Locale } from "@/lib/locale/locales";

const fetchMock = vi.fn();
const getLocaleMock = vi.fn<() => Promise<Locale>>();

vi.mock("next-intl/server", () => ({
  getLocale: () => getLocaleMock(),
}));

// getAnnouncements/getAnnouncementById are wrapped in React's cache(), which
// memoizes per module instance with no request-scoped storage under plain
// Vitest, so each test re-imports the module fresh to avoid a previous
// test's resolved value leaking into the next one.
async function importAnnouncements() {
  vi.resetModules();
  return import("./announcements");
}

describe("getAnnouncements", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    getLocaleMock.mockReset();
    getLocaleMock.mockResolvedValue("en");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns the parsed page and requests the given limit", async () => {
    const page: PaginatedAnnouncements = {
      items: [
        {
          id: "1",
          title: "Welcome",
          titleAr: "أهلاً بكم",
          body: "Hello",
          bodyAr: "مرحبًا",
          category: "general",
          publishedAt: "2024-01-01T00:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 5,
    };
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: () => page });

    const { getAnnouncements } = await importAnnouncements();
    const result = await getAnnouncements(5);

    expect(result).toEqual(page);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/v1/announcements?limit=5",
      { next: { revalidate: 3600 } },
    );
  });

  it("returns Arabic title/body for each item when the locale is ar", async () => {
    const page: PaginatedAnnouncements = {
      items: [
        {
          id: "1",
          title: "Welcome",
          titleAr: "أهلاً بكم",
          body: "Hello",
          bodyAr: "مرحبًا",
          category: "general",
          publishedAt: "2024-01-01T00:00:00.000Z",
        },
        {
          id: "2",
          title: "Field trip",
          titleAr: null,
          body: "Details",
          bodyAr: null,
          category: "events",
          publishedAt: "2024-01-02T00:00:00.000Z",
        },
      ],
      total: 2,
      page: 1,
      limit: 5,
    };
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: () => page });
    getLocaleMock.mockResolvedValue("ar");

    const { getAnnouncements } = await importAnnouncements();
    const result = await getAnnouncements(5);

    expect(result.items[0]).toMatchObject({ title: "أهلاً بكم", body: "مرحبًا" });
    // Null Arabic fields fall back to English.
    expect(result.items[1]).toMatchObject({ title: "Field trip", body: "Details" });
  });

  it("defaults limit to 20 when not provided", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => ({ items: [], total: 0, page: 1, limit: 20 }),
    });

    const { getAnnouncements } = await importAnnouncements();
    await getAnnouncements();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/v1/announcements?limit=20",
      { next: { revalidate: 3600 } },
    );
  });

  it("returns the empty page fallback when the request fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Server Error",
      json: () => ({}),
    });

    const { getAnnouncements } = await importAnnouncements();
    const result = await getAnnouncements();

    expect(result).toEqual({ items: [], total: 0, page: 1, limit: 20 });
  });
});

describe("getAnnouncementById", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    getLocaleMock.mockReset();
    getLocaleMock.mockResolvedValue("en");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns the announcement on success", async () => {
    const item: Announcement = {
      id: "a1",
      title: "Field trip",
      titleAr: "رحلة ميدانية",
      body: "Details",
      bodyAr: "تفاصيل",
      category: "events",
      publishedAt: "2024-02-01T00:00:00.000Z",
    };
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: () => item });

    const { getAnnouncementById } = await importAnnouncements();
    const result = await getAnnouncementById("a1");

    expect(result).toEqual(item);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/v1/announcements/a1",
      { next: { revalidate: 3600 } },
    );
  });

  it("returns the Arabic title/body when the locale is ar", async () => {
    const item: Announcement = {
      id: "a1",
      title: "Field trip",
      titleAr: "رحلة ميدانية",
      body: "Details",
      bodyAr: "تفاصيل",
      category: "events",
      publishedAt: "2024-02-01T00:00:00.000Z",
    };
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: () => item });
    getLocaleMock.mockResolvedValue("ar");

    const { getAnnouncementById } = await importAnnouncements();
    const result = await getAnnouncementById("a1");

    expect(result).toMatchObject({ title: "رحلة ميدانية", body: "تفاصيل" });
  });

  it("returns null when the announcement is not found", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: () => ({}),
    });

    const { getAnnouncementById } = await importAnnouncements();
    const result = await getAnnouncementById("missing");

    expect(result).toBeNull();
  });
});
