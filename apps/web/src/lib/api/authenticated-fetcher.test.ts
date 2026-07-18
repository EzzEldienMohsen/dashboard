import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NestAuthenticatedFetchClient } from "./authenticated-fetcher";

describe("NestAuthenticatedFetchClient", () => {
  const fetchMock = vi.fn();
  let client: NestAuthenticatedFetchClient;

  beforeEach(() => {
    client = new NestAuthenticatedFetchClient();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("sends the bearer token, revalidate and tags, and returns parsed JSON on success", async () => {
    const data = { id: "1", name: "School 1" };
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: () => data });

    const result = await client.get<typeof data>("/schools/1", "tok123", {
      revalidate: 30,
      tags: ["school"],
    });

    expect(result).toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3000/v1/schools/1", {
      headers: { Authorization: "Bearer tok123" },
      next: { revalidate: 30, tags: ["school"] },
    });
  });

  it("returns null and logs when the response is not ok", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      json: () => ({}),
    });

    const result = await client.get("/students", "tok", {
      revalidate: 30,
      tags: ["students"],
    });

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("403"),
    );
  });

  it("returns null and logs when fetch throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockRejectedValue(new Error("network down"));

    const result = await client.get("/students", "tok", {
      revalidate: 30,
      tags: ["students"],
    });

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("fetch failed"),
      expect.any(Error),
    );
  });
});
