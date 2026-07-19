import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getStudents,
  getStudentAnalytics,
  getStudentMonthlyAnalytics,
} from "@/lib/data";
import type { CurrentUser } from "@/lib/auth/session";
import type {
  MonthlyAnalyticsDto,
  PaginatedResult,
  StudentAnalyticsSnapshotDto,
  StudentDto,
} from "@/lib/data";

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/data", () => ({
  getStudents: vi.fn(),
  getStudentAnalytics: vi.fn(),
  getStudentMonthlyAnalytics: vi.fn(),
}));

const mockedGetCurrentUser = vi.mocked(getCurrentUser);
const mockedGetStudents = vi.mocked(getStudents);
const mockedGetStudentAnalytics = vi.mocked(getStudentAnalytics);
const mockedGetStudentMonthlyAnalytics = vi.mocked(getStudentMonthlyAnalytics);

const USER: CurrentUser = {
  id: "user-1",
  email: "teacher@school.dev",
  role: "TEACHER",
  schoolId: "school-1",
  accessToken: "token-1",
};

describe("fetchStudentsAction", () => {
  beforeEach(() => {
    mockedGetCurrentUser.mockReset();
    mockedGetStudents.mockReset();
    mockedGetStudentAnalytics.mockReset();
    mockedGetStudentMonthlyAnalytics.mockReset();
  });

  it("returns null and does not call getStudents when there is no current user", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);
    const { fetchStudentsAction } = await import("./actions");

    const result = await fetchStudentsAction(1);

    expect(result).toBeNull();
    expect(mockedGetStudents).not.toHaveBeenCalled();
  });

  it("delegates to getStudents with the user's access token, page and limit", async () => {
    mockedGetCurrentUser.mockResolvedValue(USER);
    const page: PaginatedResult<StudentDto> = {
      items: [{ id: "s1", firstName: "A", lastName: "B", classId: "c1" }],
      total: 1,
      page: 1,
      limit: 20,
    };
    mockedGetStudents.mockResolvedValue(page);
    const { fetchStudentsAction } = await import("./actions");

    const result = await fetchStudentsAction(1);

    expect(mockedGetStudents).toHaveBeenCalledWith("token-1", 1, 20, undefined);
    expect(result).toEqual(page);
  });

  it("forwards an optional classId filter to getStudents", async () => {
    mockedGetCurrentUser.mockResolvedValue(USER);
    mockedGetStudents.mockResolvedValue({
      items: [],
      total: 0,
      page: 2,
      limit: 20,
    });
    const { fetchStudentsAction } = await import("./actions");

    await fetchStudentsAction(2, "class-42");

    expect(mockedGetStudents).toHaveBeenCalledWith("token-1", 2, 20, "class-42");
  });
});

describe("fetchStudentAnalyticsAction", () => {
  beforeEach(() => {
    mockedGetCurrentUser.mockReset();
    mockedGetStudentAnalytics.mockReset();
  });

  it("returns null and does not call getStudentAnalytics when there is no current user", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);
    const { fetchStudentAnalyticsAction } = await import("./actions");

    expect(await fetchStudentAnalyticsAction("s1", "en")).toBeNull();
    expect(mockedGetStudentAnalytics).not.toHaveBeenCalled();
  });

  it("delegates to getStudentAnalytics with the user's access token, studentId, and locale", async () => {
    mockedGetCurrentUser.mockResolvedValue(USER);
    const analytics: StudentAnalyticsSnapshotDto = {
      attendanceRatePercentage: 90,
      attendanceBreakdown: { present: 9, absent: 1, late: 0, excused: 0 },
      averageGradePercentage: 85,
      gradesBySubject: [],
      improvementRatePercentage: 2,
      strengths: [],
      weaknesses: [],
      advice: [],
    };
    mockedGetStudentAnalytics.mockResolvedValue(analytics);
    const { fetchStudentAnalyticsAction } = await import("./actions");

    const result = await fetchStudentAnalyticsAction("s1", "ar");

    expect(mockedGetStudentAnalytics).toHaveBeenCalledWith("token-1", "s1", "ar");
    expect(result).toEqual(analytics);
  });
});

describe("fetchStudentMonthlyAnalyticsAction", () => {
  beforeEach(() => {
    mockedGetCurrentUser.mockReset();
    mockedGetStudentMonthlyAnalytics.mockReset();
  });

  it("returns null when there is no current user", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);
    const { fetchStudentMonthlyAnalyticsAction } = await import("./actions");

    expect(await fetchStudentMonthlyAnalyticsAction("s1")).toBeNull();
    expect(mockedGetStudentMonthlyAnalytics).not.toHaveBeenCalled();
  });

  it("delegates to getStudentMonthlyAnalytics with the user's access token and studentId", async () => {
    mockedGetCurrentUser.mockResolvedValue(USER);
    const monthly: MonthlyAnalyticsDto[] = [
      { month: "2026-06", averageGradePercentage: 80, attendanceRatePercentage: 90 },
    ];
    mockedGetStudentMonthlyAnalytics.mockResolvedValue(monthly);
    const { fetchStudentMonthlyAnalyticsAction } = await import("./actions");

    const result = await fetchStudentMonthlyAnalyticsAction("s1");

    expect(mockedGetStudentMonthlyAnalytics).toHaveBeenCalledWith("token-1", "s1");
    expect(result).toEqual(monthly);
  });
});
