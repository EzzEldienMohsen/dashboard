import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AttendanceBreakdownCard } from "./AttendanceBreakdownCard";
import type { AttendanceBreakdownDto } from "@/lib/data";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

vi.mock("@/components/atoms/DoughnutChart", () => ({
  DoughnutChart: (props: { labels: string[]; values: number[]; colorVars: string[] }) => (
    <div
      data-testid="doughnut-chart"
      data-labels={JSON.stringify(props.labels)}
      data-values={JSON.stringify(props.values)}
      data-color-vars={JSON.stringify(props.colorVars)}
    />
  ),
}));

describe("AttendanceBreakdownCard", () => {
  const breakdown: AttendanceBreakdownDto = {
    present: 80,
    absent: 5,
    late: 10,
    excused: 5,
  };

  it("renders the title and the attendance rate percentage", async () => {
    render(
      await AttendanceBreakdownCard({ breakdown, attendanceRatePercentage: 90 }),
    );

    expect(screen.getByText("attendanceBreakdownTitle")).toBeInTheDocument();
    expect(screen.getByText("90%")).toBeInTheDocument();
  });

  it("passes status labels and values through to the DoughnutChart in present/absent/late/excused order", async () => {
    render(
      await AttendanceBreakdownCard({ breakdown, attendanceRatePercentage: 90 }),
    );

    const chart = screen.getByTestId("doughnut-chart");
    expect(chart.dataset.labels).toBe(
      JSON.stringify(["present", "absent", "late", "excused"]),
    );
    expect(chart.dataset.values).toBe(JSON.stringify([80, 5, 10, 5]));
    expect(chart.dataset.colorVars).toBe(
      JSON.stringify([
        "--color-success",
        "--color-error",
        "--color-warning",
        "--color-info",
      ]),
    );
  });
});
