import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMySchool } from "./schools";
import { authenticatedFetchClient } from "@/lib/api/authenticated-fetcher";
import type { SchoolDto } from "./types";

vi.mock("@/lib/api/authenticated-fetcher", () => ({
  authenticatedFetchClient: { get: vi.fn() },
}));

const getMock = vi.mocked(authenticatedFetchClient.get);

describe("getMySchool", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("requests the school by id with the correct token, revalidate and tags", async () => {
    const school: SchoolDto = { id: "s1", name: "Riverside High", address: "1 Main St" };
    getMock.mockResolvedValue(school);

    const result = await getMySchool("tok", "s1");

    expect(result).toEqual(school);
    expect(getMock).toHaveBeenCalledWith("/schools/s1", "tok", {
      revalidate: 30,
      tags: ["school"],
    });
  });

  it("propagates null when the client returns null", async () => {
    getMock.mockResolvedValue(null);

    const result = await getMySchool("tok", "missing");

    expect(result).toBeNull();
  });
});
