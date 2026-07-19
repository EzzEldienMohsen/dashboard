import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getSchoolAnalytics,
  getSchoolMonthlyAnalytics,
  getClassesSummary,
} from "@/lib/data";
import type { CurrentUser } from "@/lib/auth/session";
import type { AnalyticsSnapshotDto, ClassSummaryDto, MonthlyAnalyticsDto } from "@/lib/data";

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/data", () => ({
  getSchoolAnalytics: vi.fn(),
  getSchoolMonthlyAnalytics: vi.fn(),
  getClassesSummary: vi.fn(),
}));

const mockedGetCurrentUser = vi.mocked(getCurrentUser);
const mockedGetSchoolAnalytics = vi.mocked(getSchoolAnalytics);
const mockedGetSchoolMonthlyAnalytics = vi.mocked(getSchoolMonthlyAnalytics);
const mockedGetClassesSummary = vi.mocked(getClassesSummary);

const USER: CurrentUser = {
  id: "user-1",
  email: "manager@school.dev",
  role: "MANAGER",
  schoolId: "school-1",
  accessToken: "token-1",
};

beforeEach(() => {
  mockedGetCurrentUser.mockReset();
  mockedGetSchoolAnalytics.mockReset();
  mockedGetSchoolMonthlyAnalytics.mockReset();
  mockedGetClassesSummary.mockReset();
});

describe("fetchSchoolAnalyticsAction", () => {
  it("returns null and does not call getSchoolAnalytics when there is no current user", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);
    const { fetchSchoolAnalyticsAction } = await import("./actions");

    const result = await fetchSchoolAnalyticsAction();

    expect(result).toBeNull();
    expect(mockedGetSchoolAnalytics).not.toHaveBeenCalled();
  });

  it("delegates to getSchoolAnalytics with the user's access token and schoolId", async () => {
    mockedGetCurrentUser.mockResolvedValue(USER);
    const analytics: AnalyticsSnapshotDto = {
      attendanceRatePercentage: 90,
      attendanceBreakdown: { present: 9, absent: 1, late: 0, excused: 0 },
      averageGradePercentage: 85,
      gradesBySubject: [],
      improvementRatePercentage: 2,
    };
    mockedGetSchoolAnalytics.mockResolvedValue(analytics);
    const { fetchSchoolAnalyticsAction } = await import("./actions");

    const result = await fetchSchoolAnalyticsAction();

    expect(mockedGetSchoolAnalytics).toHaveBeenCalledWith("token-1", "school-1");
    expect(result).toEqual(analytics);
  });
});

describe("fetchSchoolMonthlyAnalyticsAction", () => {
  it("returns null when there is no current user", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);
    const { fetchSchoolMonthlyAnalyticsAction } = await import("./actions");

    expect(await fetchSchoolMonthlyAnalyticsAction()).toBeNull();
    expect(mockedGetSchoolMonthlyAnalytics).not.toHaveBeenCalled();
  });

  it("delegates to getSchoolMonthlyAnalytics with the user's access token and schoolId", async () => {
    mockedGetCurrentUser.mockResolvedValue(USER);
    const monthly: MonthlyAnalyticsDto[] = [
      { month: "2026-06", averageGradePercentage: 80, attendanceRatePercentage: 90 },
    ];
    mockedGetSchoolMonthlyAnalytics.mockResolvedValue(monthly);
    const { fetchSchoolMonthlyAnalyticsAction } = await import("./actions");

    const result = await fetchSchoolMonthlyAnalyticsAction();

    expect(mockedGetSchoolMonthlyAnalytics).toHaveBeenCalledWith("token-1", "school-1");
    expect(result).toEqual(monthly);
  });
});

describe("fetchClassesSummaryAction", () => {
  it("returns null when there is no current user", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);
    const { fetchClassesSummaryAction } = await import("./actions");

    expect(await fetchClassesSummaryAction()).toBeNull();
    expect(mockedGetClassesSummary).not.toHaveBeenCalled();
  });

  it("delegates to getClassesSummary with the user's access token and schoolId", async () => {
    mockedGetCurrentUser.mockResolvedValue(USER);
    const summary: ClassSummaryDto[] = [
      {
        classId: "class-1",
        className: "Grade 4-A",
        attendanceRatePercentage: 90,
        attendanceBreakdown: { present: 9, absent: 1, late: 0, excused: 0 },
        averageGradePercentage: 85,
        gradesBySubject: [],
      },
    ];
    mockedGetClassesSummary.mockResolvedValue(summary);
    const { fetchClassesSummaryAction } = await import("./actions");

    const result = await fetchClassesSummaryAction();

    expect(mockedGetClassesSummary).toHaveBeenCalledWith("token-1", "school-1");
    expect(result).toEqual(summary);
  });
});
