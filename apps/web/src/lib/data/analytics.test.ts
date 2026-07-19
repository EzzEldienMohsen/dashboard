import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getSchoolAnalytics,
  getClassAnalytics,
  getStudentAnalytics,
  getSchoolMonthlyAnalytics,
  getClassMonthlyAnalytics,
  getStudentMonthlyAnalytics,
  getClassesSummary,
} from "./analytics";
import { authenticatedFetchClient } from "@/lib/api/authenticated-fetcher";
import type {
  AnalyticsSnapshotDto,
  ClassSummaryDto,
  MonthlyAnalyticsDto,
  StudentAnalyticsSnapshotDto,
} from "./types";

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
      improvementRatePercentage: 5,
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

describe("getStudentAnalytics", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("requests student analytics with the resolved locale forwarded", async () => {
    const analytics: StudentAnalyticsSnapshotDto = {
      attendanceRatePercentage: 90,
      attendanceBreakdown: { present: 10, absent: 1, late: 0, excused: 0 },
      averageGradePercentage: 80,
      gradesBySubject: [{ subject: "Math", averagePercentage: 85 }],
      improvementRatePercentage: 5,
      strengths: [{ subject: "Math", averagePercentage: 85 }],
      weaknesses: [],
      advice: [
        { subject: "Math", severity: "strength", message: "Great job!" },
      ],
    };
    getMock.mockResolvedValue(analytics);

    const result = await getStudentAnalytics("tok", "student-1", "ar");

    expect(result).toEqual(analytics);
    expect(getMock).toHaveBeenCalledWith(
      "/students/student-1/analytics",
      "tok",
      { revalidate: 30, tags: ["analytics"], locale: "ar" },
    );
  });
});

describe("getSchoolMonthlyAnalytics", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("requests the default 6-month window", async () => {
    const monthly: MonthlyAnalyticsDto[] = [
      { month: "2026-06", averageGradePercentage: 80, attendanceRatePercentage: 90 },
    ];
    getMock.mockResolvedValue(monthly);

    const result = await getSchoolMonthlyAnalytics("tok", "school-1");

    expect(result).toEqual(monthly);
    expect(getMock).toHaveBeenCalledWith(
      "/schools/school-1/analytics/monthly?months=6",
      "tok",
      { revalidate: 30, tags: ["analytics"] },
    );
  });

  it("uses a custom months window when provided", async () => {
    getMock.mockResolvedValue(null);

    await getSchoolMonthlyAnalytics("tok", "school-1", 12);

    expect(getMock).toHaveBeenCalledWith(
      "/schools/school-1/analytics/monthly?months=12",
      "tok",
      { revalidate: 30, tags: ["analytics"] },
    );
  });
});

describe("getClassMonthlyAnalytics", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("requests the default 6-month window", async () => {
    getMock.mockResolvedValue(null);

    await getClassMonthlyAnalytics("tok", "class-1");

    expect(getMock).toHaveBeenCalledWith(
      "/classes/class-1/analytics/monthly?months=6",
      "tok",
      { revalidate: 30, tags: ["analytics"] },
    );
  });
});

describe("getStudentMonthlyAnalytics", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("requests the default 6-month window", async () => {
    getMock.mockResolvedValue(null);

    await getStudentMonthlyAnalytics("tok", "student-1");

    expect(getMock).toHaveBeenCalledWith(
      "/students/student-1/analytics/monthly?months=6",
      "tok",
      { revalidate: 30, tags: ["analytics"] },
    );
  });
});

describe("getClassesSummary", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("requests the batched classes analytics summary for the school", async () => {
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
    getMock.mockResolvedValue(summary);

    const result = await getClassesSummary("tok", "school-1");

    expect(result).toEqual(summary);
    expect(getMock).toHaveBeenCalledWith(
      "/schools/school-1/classes/analytics-summary",
      "tok",
      { revalidate: 30, tags: ["analytics"] },
    );
  });
});
