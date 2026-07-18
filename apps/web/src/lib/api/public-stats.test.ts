import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PublicStats } from "./types";

const fetchMock = vi.fn();

// getPublicStats is wrapped in React's cache(); re-import fresh per test so
// one test's resolved value can't leak into the next under plain Vitest.
async function importPublicStats() {
  vi.resetModules();
  return import("./public-stats");
}

describe("getPublicStats", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns the parsed stats on success", async () => {
    const stats: PublicStats = {
      schoolsCount: 12,
      studentsCount: 340,
      teachersCount: 45,
    };
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: () => stats });

    const { getPublicStats } = await importPublicStats();
    const result = await getPublicStats();

    expect(result).toEqual(stats);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/v1/public/stats",
      { next: { revalidate: 3600 } },
    );
  });

  it("returns the zeroed default stats when the request fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
      json: () => ({}),
    });

    const { getPublicStats } = await importPublicStats();
    const result = await getPublicStats();

    expect(result).toEqual({ schoolsCount: 0, studentsCount: 0, teachersCount: 0 });
  });

  it("returns the zeroed default stats when fetch throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockRejectedValue(new Error("network down"));

    const { getPublicStats } = await importPublicStats();
    const result = await getPublicStats();

    expect(result).toEqual({ schoolsCount: 0, studentsCount: 0, teachersCount: 0 });
  });
});
