import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SchoolAnalyticsSection } from "./SchoolAnalyticsSection";
import type {
  AnalyticsSnapshotDto,
  ClassSummaryDto,
  MonthlyAnalyticsDto,
} from "@/lib/data";

vi.mock("@/components/organisms/AnalyticsPanel", () => ({
  AnalyticsPanel: ({ snapshot }: { snapshot: AnalyticsSnapshotDto }) => (
    <div data-testid="analytics-panel">{snapshot.averageGradePercentage}</div>
  ),
}));

vi.mock("@/components/organisms/ClassesSummaryLinks", () => ({
  ClassesSummaryLinks: ({ classes }: { classes: ClassSummaryDto[] }) => (
    <div data-testid="classes-summary-links">{classes.length}</div>
  ),
}));

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const ANALYTICS: AnalyticsSnapshotDto = {
  attendanceRatePercentage: 90,
  attendanceBreakdown: { present: 9, absent: 1, late: 0, excused: 0 },
  averageGradePercentage: 85,
  gradesBySubject: [],
  improvementRatePercentage: 2,
};

const MONTHLY: MonthlyAnalyticsDto[] = [
  { month: "2026-06", averageGradePercentage: 85, attendanceRatePercentage: 90 },
];

const CLASSES: ClassSummaryDto[] = [
  {
    classId: "class-1",
    className: "Grade 4-A",
    attendanceRatePercentage: 90,
    attendanceBreakdown: { present: 9, absent: 1, late: 0, excused: 0 },
    averageGradePercentage: 85,
    gradesBySubject: [],
  },
];

describe("SchoolAnalyticsSection", () => {
  it("renders from initialData without waiting on the fetch actions", () => {
    const fetchAnalytics = vi.fn(() => new Promise<never>(() => {}));
    const fetchMonthly = vi.fn(() => new Promise<never>(() => {}));
    const fetchClassesSummary = vi.fn(() => new Promise<never>(() => {}));

    renderWithQueryClient(
      <SchoolAnalyticsSection
        initialAnalytics={ANALYTICS}
        initialMonthly={MONTHLY}
        initialClassesSummary={CLASSES}
        fetchAnalytics={fetchAnalytics}
        fetchMonthly={fetchMonthly}
        fetchClassesSummary={fetchClassesSummary}
      />,
    );

    expect(screen.getByTestId("analytics-panel")).toHaveTextContent("85");
    expect(screen.getByTestId("classes-summary-links")).toHaveTextContent("1");
  });

  it("falls back to initialData/empty arrays when a query resolves to null", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(["schoolAnalytics"], null);
    queryClient.setQueryData(["schoolMonthlyAnalytics"], null);
    queryClient.setQueryData(["classesSummary"], null);
    const fetchAnalytics = vi.fn(() => new Promise<never>(() => {}));
    const fetchMonthly = vi.fn(() => new Promise<never>(() => {}));
    const fetchClassesSummary = vi.fn(() => new Promise<never>(() => {}));

    render(
      <QueryClientProvider client={queryClient}>
        <SchoolAnalyticsSection
          initialAnalytics={ANALYTICS}
          initialMonthly={MONTHLY}
          initialClassesSummary={CLASSES}
          fetchAnalytics={fetchAnalytics}
          fetchMonthly={fetchMonthly}
          fetchClassesSummary={fetchClassesSummary}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("analytics-panel")).toHaveTextContent("85");
    expect(screen.getByTestId("classes-summary-links")).toHaveTextContent("0");
  });
});
