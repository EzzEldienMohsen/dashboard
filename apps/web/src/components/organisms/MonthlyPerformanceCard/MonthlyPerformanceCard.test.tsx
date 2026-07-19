import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MonthlyPerformanceCard } from "./MonthlyPerformanceCard";
import * as Sentry from "@sentry/nextjs";
import type { MonthlyAnalyticsDto } from "@/lib/data";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({
    dateTime: (date: Date) =>
      `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`,
  }),
}));

vi.mock("@sentry/nextjs", () => ({ addBreadcrumb: vi.fn() }));

const MONTHLY: MonthlyAnalyticsDto[] = [
  { month: "2026-05", averageGradePercentage: 70, attendanceRatePercentage: 85 },
  { month: "2026-06", averageGradePercentage: 88, attendanceRatePercentage: 92 },
];

describe("MonthlyPerformanceCard", () => {
  it("defaults to the most recent month", () => {
    render(<MonthlyPerformanceCard monthly={MONTHLY} />);

    const progressBars = screen.getAllByRole("progressbar");
    expect(progressBars[0]).toHaveTextContent("88%");
    expect(progressBars[1]).toHaveTextContent("92%");
  });

  it("switches the displayed month via the dropdown and adds a Sentry breadcrumb", () => {
    render(<MonthlyPerformanceCard monthly={MONTHLY} />);

    fireEvent.change(screen.getByLabelText("selectMonth"), {
      target: { value: "0" },
    });

    const progressBars = screen.getAllByRole("progressbar");
    expect(progressBars[0]).toHaveTextContent("70%");
    expect(progressBars[1]).toHaveTextContent("85%");
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "ui.interaction",
        message: "month-performance-dropdown-changed",
        data: { month: "2026-05" },
      }),
    );
  });

  it("renders nothing when there is no monthly data", () => {
    const { container } = render(<MonthlyPerformanceCard monthly={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
