import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser } from "@/lib/auth/session";
import { getClassAnalytics, getClassMonthlyAnalytics } from "@/lib/data";
import type { CurrentUser } from "@/lib/auth/session";
import type { AnalyticsSnapshotDto, MonthlyAnalyticsDto } from "@/lib/data";

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/data", () => ({
  getClassAnalytics: vi.fn(),
  getClassMonthlyAnalytics: vi.fn(),
}));

const mockedGetCurrentUser = vi.mocked(getCurrentUser);
const mockedGetClassAnalytics = vi.mocked(getClassAnalytics);
const mockedGetClassMonthlyAnalytics = vi.mocked(getClassMonthlyAnalytics);

const USER: CurrentUser = {
  id: "user-1",
  email: "teacher@school.dev",
  role: "TEACHER",
  schoolId: "school-1",
  accessToken: "token-1",
};

beforeEach(() => {
  mockedGetCurrentUser.mockReset();
  mockedGetClassAnalytics.mockReset();
  mockedGetClassMonthlyAnalytics.mockReset();
});

describe("fetchClassAnalyticsAction", () => {
  it("returns null and does not call getClassAnalytics when there is no current user", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);
    const { fetchClassAnalyticsAction } = await import("./actions");

    expect(await fetchClassAnalyticsAction("class-1")).toBeNull();
    expect(mockedGetClassAnalytics).not.toHaveBeenCalled();
  });

  it("delegates to getClassAnalytics with the user's access token and classId", async () => {
    mockedGetCurrentUser.mockResolvedValue(USER);
    const analytics: AnalyticsSnapshotDto = {
      attendanceRatePercentage: 90,
      attendanceBreakdown: { present: 9, absent: 1, late: 0, excused: 0 },
      averageGradePercentage: 85,
      gradesBySubject: [],
      improvementRatePercentage: 2,
    };
    mockedGetClassAnalytics.mockResolvedValue(analytics);
    const { fetchClassAnalyticsAction } = await import("./actions");

    const result = await fetchClassAnalyticsAction("class-1");

    expect(mockedGetClassAnalytics).toHaveBeenCalledWith("token-1", "class-1");
    expect(result).toEqual(analytics);
  });
});

describe("fetchClassMonthlyAnalyticsAction", () => {
  it("returns null when there is no current user", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);
    const { fetchClassMonthlyAnalyticsAction } = await import("./actions");

    expect(await fetchClassMonthlyAnalyticsAction("class-1")).toBeNull();
    expect(mockedGetClassMonthlyAnalytics).not.toHaveBeenCalled();
  });

  it("delegates to getClassMonthlyAnalytics with the user's access token and classId", async () => {
    mockedGetCurrentUser.mockResolvedValue(USER);
    const monthly: MonthlyAnalyticsDto[] = [
      { month: "2026-06", averageGradePercentage: 80, attendanceRatePercentage: 90 },
    ];
    mockedGetClassMonthlyAnalytics.mockResolvedValue(monthly);
    const { fetchClassMonthlyAnalyticsAction } = await import("./actions");

    const result = await fetchClassMonthlyAnalyticsAction("class-1");

    expect(mockedGetClassMonthlyAnalytics).toHaveBeenCalledWith("token-1", "class-1");
    expect(result).toEqual(monthly);
  });
});
