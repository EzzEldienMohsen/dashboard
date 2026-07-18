import { beforeEach, describe, expect, it, vi } from "vitest";
import { getStudents } from "./students";
import { authenticatedFetchClient } from "@/lib/api/authenticated-fetcher";
import type { PaginatedResult, StudentDto } from "./types";

vi.mock("@/lib/api/authenticated-fetcher", () => ({
  authenticatedFetchClient: { get: vi.fn() },
}));

const getMock = vi.mocked(authenticatedFetchClient.get);

describe("getStudents", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("requests the given page and default limit without a class filter", async () => {
    const page: PaginatedResult<StudentDto> = {
      items: [{ id: "st1", firstName: "Ada", lastName: "Lovelace", classId: "c1" }],
      total: 1,
      page: 1,
      limit: 20,
    };
    getMock.mockResolvedValue(page);

    const result = await getStudents("tok", 1);

    expect(result).toEqual(page);
    expect(getMock).toHaveBeenCalledWith("/students?page=1&limit=20", "tok", {
      revalidate: 30,
      tags: ["students"],
    });
  });

  it("uses a custom limit when provided", async () => {
    getMock.mockResolvedValue(null);

    await getStudents("tok", 3, 10);

    expect(getMock).toHaveBeenCalledWith("/students?page=3&limit=10", "tok", {
      revalidate: 30,
      tags: ["students"],
    });
  });

  it("appends the classId filter when provided", async () => {
    getMock.mockResolvedValue(null);

    await getStudents("tok", 1, 20, "c1");

    expect(getMock).toHaveBeenCalledWith("/students?page=1&limit=20&classId=c1", "tok", {
      revalidate: 30,
      tags: ["students"],
    });
  });
});
