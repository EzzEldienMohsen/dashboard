import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnalyticsPanel } from "./AnalyticsPanel";
import type { AnalyticsSnapshotDto, MonthlyAnalyticsDto } from "@/lib/data";

vi.mock("@/components/organisms/AttendanceBreakdownCard", () => ({
  AttendanceBreakdownCard: ({ title }: { title?: string }) => (
    <div data-testid="attendance-card">{title ?? "default-title"}</div>
  ),
}));

vi.mock("@/components/organisms/GradesBySubjectCard", () => ({
  GradesBySubjectCard: () => <div data-testid="grades-card" />,
}));

vi.mock("@/components/organisms/MonthlyPerformanceCard", () => ({
  MonthlyPerformanceCard: () => <div data-testid="monthly-card" />,
}));

vi.mock("@/components/organisms/PerformanceTrendCard", () => ({
  PerformanceTrendCard: () => <div data-testid="trend-card" />,
}));

vi.mock("@/components/organisms/ImprovementRateCard", () => ({
  ImprovementRateCard: ({
    improvementRatePercentage,
  }: {
    improvementRatePercentage: number;
  }) => <div data-testid="improvement-card">{improvementRatePercentage}</div>,
}));

const snapshot: AnalyticsSnapshotDto = {
  attendanceRatePercentage: 90,
  attendanceBreakdown: { present: 9, absent: 1, late: 0, excused: 0 },
  averageGradePercentage: 85,
  gradesBySubject: [],
  improvementRatePercentage: 7,
};

const monthly: MonthlyAnalyticsDto[] = [
  { month: "2026-06", averageGradePercentage: 85, attendanceRatePercentage: 90 },
];

describe("AnalyticsPanel", () => {
  it("renders all five analytics cards", () => {
    render(<AnalyticsPanel snapshot={snapshot} monthly={monthly} />);

    expect(screen.getByTestId("attendance-card")).toBeInTheDocument();
    expect(screen.getByTestId("grades-card")).toBeInTheDocument();
    expect(screen.getByTestId("monthly-card")).toBeInTheDocument();
    expect(screen.getByTestId("trend-card")).toBeInTheDocument();
    expect(screen.getByTestId("improvement-card")).toHaveTextContent("7");
  });

  it("uses the default attendance title when none is provided", () => {
    render(<AnalyticsPanel snapshot={snapshot} monthly={monthly} />);

    expect(screen.getByTestId("attendance-card")).toHaveTextContent(
      "default-title",
    );
  });

  it("forwards a custom attendance title (e.g. Commitment on the student page)", () => {
    render(
      <AnalyticsPanel
        snapshot={snapshot}
        monthly={monthly}
        attendanceTitle="Commitment"
      />,
    );

    expect(screen.getByTestId("attendance-card")).toHaveTextContent(
      "Commitment",
    );
  });
});
