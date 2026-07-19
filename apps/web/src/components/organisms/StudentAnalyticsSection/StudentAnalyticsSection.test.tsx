import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StudentAnalyticsSection } from "./StudentAnalyticsSection";
import type { StudentAnalyticsSnapshotDto, MonthlyAnalyticsDto } from "@/lib/data";

vi.mock("@/components/organisms/AnalyticsPanel", () => ({
  AnalyticsPanel: ({
    snapshot,
    attendanceTitle,
  }: {
    snapshot: StudentAnalyticsSnapshotDto;
    attendanceTitle?: string;
  }) => (
    <div data-testid="analytics-panel" data-attendance-title={attendanceTitle}>
      {snapshot.averageGradePercentage}
    </div>
  ),
}));

vi.mock("@/components/organisms/StrengthsWeaknessesCard", () => ({
  StrengthsWeaknessesCard: ({
    strengths,
  }: {
    strengths: { subject: string }[];
  }) => <div data-testid="strengths-card">{strengths.length}</div>,
}));

vi.mock("@/components/organisms/AdviceCard", () => ({
  AdviceCard: ({ advice }: { advice: unknown[] }) => (
    <div data-testid="advice-card">{advice.length}</div>
  ),
}));

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const ANALYTICS: StudentAnalyticsSnapshotDto = {
  attendanceRatePercentage: 90,
  attendanceBreakdown: { present: 9, absent: 1, late: 0, excused: 0 },
  averageGradePercentage: 94,
  gradesBySubject: [],
  improvementRatePercentage: 1,
  strengths: [{ subject: "Math", averagePercentage: 95 }],
  weaknesses: [],
  advice: [{ subject: "Math", severity: "strength", message: "Great job!" }],
};

const MONTHLY: MonthlyAnalyticsDto[] = [
  { month: "2026-06", averageGradePercentage: 94, attendanceRatePercentage: 90 },
];

describe("StudentAnalyticsSection", () => {
  it("renders from initialData without waiting on the fetch actions", () => {
    const fetchAnalytics = vi.fn(() => new Promise<never>(() => {}));
    const fetchMonthly = vi.fn(() => new Promise<never>(() => {}));

    renderWithQueryClient(
      <StudentAnalyticsSection
        studentId="s1"
        locale="en"
        attendanceTitle="Commitment"
        initialAnalytics={ANALYTICS}
        initialMonthly={MONTHLY}
        fetchAnalytics={fetchAnalytics}
        fetchMonthly={fetchMonthly}
      />,
    );

    expect(screen.getByTestId("analytics-panel")).toHaveTextContent("94");
    expect(screen.getByTestId("analytics-panel")).toHaveAttribute(
      "data-attendance-title",
      "Commitment",
    );
    expect(screen.getByTestId("strengths-card")).toHaveTextContent("1");
    expect(screen.getByTestId("advice-card")).toHaveTextContent("1");
  });

  it("keys the analytics query by studentId and locale together", () => {
    const queryClient = new QueryClient();
    const fetchAnalytics = vi.fn(() => new Promise<never>(() => {}));
    const fetchMonthly = vi.fn(() => new Promise<never>(() => {}));

    render(
      <QueryClientProvider client={queryClient}>
        <StudentAnalyticsSection
          studentId="s1"
          locale="ar"
          attendanceTitle="Commitment"
          initialAnalytics={ANALYTICS}
          initialMonthly={MONTHLY}
          fetchAnalytics={fetchAnalytics}
          fetchMonthly={fetchMonthly}
        />
      </QueryClientProvider>,
    );

    expect(
      queryClient.getQueryData(["studentAnalytics", "s1", "ar"]),
    ).toEqual(ANALYTICS);
  });

  it("falls back to initialData/an empty array when a query resolves to null", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(["studentAnalytics", "s2", "en"], null);
    queryClient.setQueryData(["studentMonthlyAnalytics", "s2"], null);
    const fetchAnalytics = vi.fn(() => new Promise<never>(() => {}));
    const fetchMonthly = vi.fn(() => new Promise<never>(() => {}));

    render(
      <QueryClientProvider client={queryClient}>
        <StudentAnalyticsSection
          studentId="s2"
          locale="en"
          attendanceTitle="Commitment"
          initialAnalytics={ANALYTICS}
          initialMonthly={MONTHLY}
          fetchAnalytics={fetchAnalytics}
          fetchMonthly={fetchMonthly}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("analytics-panel")).toHaveTextContent("94");
    expect(screen.getByTestId("strengths-card")).toHaveTextContent("1");
  });
});
