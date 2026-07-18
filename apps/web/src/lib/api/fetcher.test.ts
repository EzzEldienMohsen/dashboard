import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "./fetcher";

describe("apiFetch", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns parsed JSON and calls fetch with the versioned URL and revalidate option", async () => {
    const data = { hello: "world" };
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => data,
    });

    const result = await apiFetch<typeof data>("/foo");

    expect(result).toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3000/v1/foo", {
      next: { revalidate: 3600 },
    });
  });

  it("returns null and logs when the response is not ok", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: () => ({}),
    });

    const result = await apiFetch("/missing");

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("404"),
    );
  });

  it("returns null and logs when fetch throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockRejectedValue(new Error("network down"));

    const result = await apiFetch("/boom");

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("fetch failed"),
      expect.any(Error),
    );
  });
});
