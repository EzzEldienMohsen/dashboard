import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GradesBySubjectCard } from "./GradesBySubjectCard";
import type { SubjectAverageDto } from "@/lib/data";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

vi.mock("@/components/atoms/BarChart", () => ({
  BarChart: (props: { labels: string[]; values: number[]; colorVar: string; maxValue?: number }) => (
    <div
      data-testid="bar-chart"
      data-labels={JSON.stringify(props.labels)}
      data-values={JSON.stringify(props.values)}
      data-color-var={props.colorVar}
      data-max-value={props.maxValue}
    />
  ),
}));

describe("GradesBySubjectCard", () => {
  it("renders the title and the average grade percentage", async () => {
    const gradesBySubject: SubjectAverageDto[] = [
      { subject: "Math", averagePercentage: 85 },
      { subject: "Science", averagePercentage: 70 },
    ];

    render(
      await GradesBySubjectCard({ gradesBySubject, averageGradePercentage: 78 }),
    );

    expect(screen.getByText("gradesBySubjectTitle")).toBeInTheDocument();
    expect(screen.getByText("78%")).toBeInTheDocument();
  });

  it("passes subject labels and percentage values through to the BarChart", async () => {
    const gradesBySubject: SubjectAverageDto[] = [
      { subject: "Math", averagePercentage: 85 },
      { subject: "Science", averagePercentage: 70 },
    ];

    render(
      await GradesBySubjectCard({ gradesBySubject, averageGradePercentage: 78 }),
    );

    const chart = screen.getByTestId("bar-chart");
    expect(chart.dataset.labels).toBe(JSON.stringify(["Math", "Science"]));
    expect(chart.dataset.values).toBe(JSON.stringify([85, 70]));
    expect(chart.dataset.colorVar).toBe("--color-primary");
    expect(chart.dataset.maxValue).toBe("100");
  });
});
