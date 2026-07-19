import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PerformanceTrendCard } from "./PerformanceTrendCard";
import type { MonthlyAnalyticsDto } from "@/lib/data";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({
    dateTime: (date: Date) => `M${date.getUTCMonth() + 1}`,
  }),
}));

vi.mock("@/components/atoms/LineChart", () => ({
  LineChart: (props: {
    labels: string[];
    datasets: { label: string; values: number[] }[];
  }) => (
    <div
      data-testid="line-chart"
      data-labels={JSON.stringify(props.labels)}
      data-dataset-labels={JSON.stringify(
        props.datasets.map((dataset) => dataset.label),
      )}
      data-values={JSON.stringify(props.datasets.map((dataset) => dataset.values))}
    />
  ),
}));

const MONTHLY: MonthlyAnalyticsDto[] = [
  { month: "2026-05", averageGradePercentage: 70, attendanceRatePercentage: 85 },
  { month: "2026-06", averageGradePercentage: 88, attendanceRatePercentage: 92 },
];

describe("PerformanceTrendCard", () => {
  it("renders the title and passes formatted month labels plus both series to the chart", () => {
    render(<PerformanceTrendCard monthly={MONTHLY} />);

    expect(screen.getByText("trendTitle")).toBeInTheDocument();

    const chart = screen.getByTestId("line-chart");
    expect(chart.dataset.labels).toBe(JSON.stringify(["M5", "M6"]));
    expect(chart.dataset.datasetLabels).toBe(
      JSON.stringify(["trendGradeLabel", "trendAttendanceLabel"]),
    );
    expect(chart.dataset.values).toBe(
      JSON.stringify([
        [70, 88],
        [85, 92],
      ]),
    );
  });
});
