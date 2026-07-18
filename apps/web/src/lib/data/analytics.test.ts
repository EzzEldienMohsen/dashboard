import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSchoolAnalytics, getClassAnalytics } from "./analytics";
import { authenticatedFetchClient } from "@/lib/api/authenticated-fetcher";
import type { AnalyticsSnapshotDto } from "./types";

vi.mock("@/lib/api/authenticated-fetcher", () => ({
  authenticatedFetchClient: { get: vi.fn() },
}));

const getMock = vi.mocked(authenticatedFetchClient.get);

describe("getSchoolAnalytics", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("requests school analytics with the correct path, token, revalidate and tags", async () => {
    const snapshot: AnalyticsSnapshotDto = {
      attendanceRatePercentage: 90,
      attendanceBreakdown: { present: 10, absent: 1, late: 0, excused: 0 },
      averageGradePercentage: 80,
      gradesBySubject: [{ subject: "Math", averagePercentage: 85 }],
    };
    getMock.mockResolvedValue(snapshot);

    const result = await getSchoolAnalytics("tok", "school-1");

    expect(result).toEqual(snapshot);
    expect(getMock).toHaveBeenCalledWith("/schools/school-1/analytics", "tok", {
      revalidate: 30,
      tags: ["analytics"],
    });
  });

  it("propagates null when the client returns null", async () => {
    getMock.mockResolvedValue(null);

    const result = await getSchoolAnalytics("tok", "school-2");

    expect(result).toBeNull();
  });
});

describe("getClassAnalytics", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("requests class analytics with the correct path, token, revalidate and tags", async () => {
    getMock.mockResolvedValue(null);

    const result = await getClassAnalytics("tok", "class-1");

    expect(result).toBeNull();
    expect(getMock).toHaveBeenCalledWith("/classes/class-1/analytics", "tok", {
      revalidate: 30,
      tags: ["analytics"],
    });
  });
});
