import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SchoolProfile } from "./types";
import type { Locale } from "@/lib/locale/locales";

const fetchMock = vi.fn();
const getLocaleMock = vi.fn<() => Promise<Locale>>();

vi.mock("next-intl/server", () => ({
  getLocale: () => getLocaleMock(),
}));

// getSchoolProfile is wrapped in React's cache(); re-import fresh per test so
// one test's resolved value can't leak into the next under plain Vitest.
async function importSchoolProfile() {
  vi.resetModules();
  return import("./school-profile");
}

describe("getSchoolProfile", () => {
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

  it("returns the parsed profile on success", async () => {
    const profile: SchoolProfile = {
      id: "s1",
      name: "Riverside High",
      nameAr: "مدرسة ريفرسايد",
      mission: "Educate everyone.",
      missionAr: "تعليم الجميع.",
      foundedYear: 1999,
      address: "1 Main St",
      contactEmail: "hello@riverside.edu",
      contactPhone: "555-1234",
      updatedAt: "2024-03-01T00:00:00.000Z",
    };
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: () => profile });

    const { getSchoolProfile } = await importSchoolProfile();
    const result = await getSchoolProfile();

    expect(result).toEqual(profile);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/v1/school-profile",
      { next: { revalidate: 3600 } },
    );
  });

  it("returns the Arabic name/mission when the locale is ar", async () => {
    const profile: SchoolProfile = {
      id: "s1",
      name: "Riverside High",
      nameAr: "مدرسة ريفرسايد",
      mission: "Educate everyone.",
      missionAr: "تعليم الجميع.",
      foundedYear: 1999,
      address: "1 Main St",
      contactEmail: "hello@riverside.edu",
      contactPhone: "555-1234",
      updatedAt: "2024-03-01T00:00:00.000Z",
    };
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: () => profile });
    getLocaleMock.mockResolvedValue("ar");

    const { getSchoolProfile } = await importSchoolProfile();
    const result = await getSchoolProfile();

    expect(result.name).toBe("مدرسة ريفرسايد");
    expect(result.mission).toBe("تعليم الجميع.");
  });

  it("falls back to English when the locale is ar but the Arabic fields are null", async () => {
    const profile: SchoolProfile = {
      id: "s1",
      name: "Riverside High",
      nameAr: null,
      mission: "Educate everyone.",
      missionAr: null,
      foundedYear: 1999,
      address: "1 Main St",
      contactEmail: "hello@riverside.edu",
      contactPhone: "555-1234",
      updatedAt: "2024-03-01T00:00:00.000Z",
    };
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: () => profile });
    getLocaleMock.mockResolvedValue("ar");

    const { getSchoolProfile } = await importSchoolProfile();
    const result = await getSchoolProfile();

    expect(result.name).toBe("Riverside High");
    expect(result.mission).toBe("Educate everyone.");
  });

  it("returns the default profile when the request fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Server Error",
      json: () => ({}),
    });

    const { getSchoolProfile } = await importSchoolProfile();
    const result = await getSchoolProfile();

    expect(result).toMatchObject({
      id: "",
      name: "Campus Dashboard",
      nameAr: null,
      mission: "",
      missionAr: null,
      foundedYear: 0,
      address: "",
      contactEmail: "",
      contactPhone: null,
    });
    // updatedAt is computed at module load time via `new Date().toISOString()`,
    // so assert shape rather than an exact value.
    expect(typeof result.updatedAt).toBe("string");
    expect(Number.isNaN(new Date(result.updatedAt).getTime())).toBe(false);
  });
});
