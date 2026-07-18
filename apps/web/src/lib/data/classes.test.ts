import { beforeEach, describe, expect, it, vi } from "vitest";
import { getClasses } from "./classes";
import { authenticatedFetchClient } from "@/lib/api/authenticated-fetcher";
import type { ClassDto, PaginatedResult } from "./types";

vi.mock("@/lib/api/authenticated-fetcher", () => ({
  authenticatedFetchClient: { get: vi.fn() },
}));

const getMock = vi.mocked(authenticatedFetchClient.get);

describe("getClasses", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("requests the given page and default limit with the correct token, revalidate and tags", async () => {
    const page: PaginatedResult<ClassDto> = {
      items: [{ id: "c1", name: "Class A", schoolId: "s1" }],
      total: 1,
      page: 2,
      limit: 20,
    };
    getMock.mockResolvedValue(page);

    const result = await getClasses("tok", 2);

    expect(result).toEqual(page);
    expect(getMock).toHaveBeenCalledWith("/classes?page=2&limit=20", "tok", {
      revalidate: 30,
      tags: ["classes"],
    });
  });

  it("uses a custom limit when provided", async () => {
    getMock.mockResolvedValue(null);

    await getClasses("tok", 1, 5);

    expect(getMock).toHaveBeenCalledWith("/classes?page=1&limit=5", "tok", {
      revalidate: 30,
      tags: ["classes"],
    });
  });
});
