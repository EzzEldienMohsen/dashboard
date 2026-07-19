import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClassAnalyticsSection } from "./ClassAnalyticsSection";
import type { AnalyticsSnapshotDto, MonthlyAnalyticsDto } from "@/lib/data";

vi.mock("@/components/organisms/AnalyticsPanel", () => ({
  AnalyticsPanel: ({ snapshot }: { snapshot: AnalyticsSnapshotDto }) => (
    <div data-testid="analytics-panel">{snapshot.averageGradePercentage}</div>
  ),
}));

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const ANALYTICS: AnalyticsSnapshotDto = {
  attendanceRatePercentage: 90,
  attendanceBreakdown: { present: 9, absent: 1, late: 0, excused: 0 },
  averageGradePercentage: 86,
  gradesBySubject: [],
  improvementRatePercentage: 1,
};

const MONTHLY: MonthlyAnalyticsDto[] = [
  { month: "2026-06", averageGradePercentage: 86, attendanceRatePercentage: 90 },
];

describe("ClassAnalyticsSection", () => {
  it("renders from initialData without waiting on the fetch actions", () => {
    const fetchAnalytics = vi.fn(() => new Promise<never>(() => {}));
    const fetchMonthly = vi.fn(() => new Promise<never>(() => {}));

    renderWithQueryClient(
      <ClassAnalyticsSection
        classId="class-1"
        initialAnalytics={ANALYTICS}
        initialMonthly={MONTHLY}
        fetchAnalytics={fetchAnalytics}
        fetchMonthly={fetchMonthly}
      />,
    );

    expect(screen.getByTestId("analytics-panel")).toHaveTextContent("86");
  });

  it("keys its queries by classId so different classes get independent cache entries", () => {
    const queryClient = new QueryClient();
    const fetchAnalytics = vi.fn(() => new Promise<never>(() => {}));
    const fetchMonthly = vi.fn(() => new Promise<never>(() => {}));

    render(
      <QueryClientProvider client={queryClient}>
        <ClassAnalyticsSection
          classId="class-2"
          initialAnalytics={ANALYTICS}
          initialMonthly={MONTHLY}
          fetchAnalytics={fetchAnalytics}
          fetchMonthly={fetchMonthly}
        />
      </QueryClientProvider>,
    );

    expect(
      queryClient.getQueryData(["classAnalytics", "class-2"]),
    ).toEqual(ANALYTICS);
  });

  it("falls back to initialData/an empty array when a query resolves to null", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(["classAnalytics", "class-3"], null);
    queryClient.setQueryData(["classMonthlyAnalytics", "class-3"], null);
    const fetchAnalytics = vi.fn(() => new Promise<never>(() => {}));
    const fetchMonthly = vi.fn(() => new Promise<never>(() => {}));

    render(
      <QueryClientProvider client={queryClient}>
        <ClassAnalyticsSection
          classId="class-3"
          initialAnalytics={ANALYTICS}
          initialMonthly={MONTHLY}
          fetchAnalytics={fetchAnalytics}
          fetchMonthly={fetchMonthly}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("analytics-panel")).toHaveTextContent("86");
  });
});
