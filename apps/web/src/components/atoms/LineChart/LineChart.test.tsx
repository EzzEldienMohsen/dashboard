import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LineChart } from "./LineChart";

vi.mock("react-chartjs-2", () => ({
  Line: (props: {
    data: { labels: string[]; datasets: { label: string; data: number[] }[] };
  }) => (
    <div
      data-testid="line"
      data-labels={JSON.stringify(props.data.labels)}
      data-dataset-labels={JSON.stringify(
        props.data.datasets.map((dataset) => dataset.label),
      )}
      data-values={JSON.stringify(props.data.datasets.map((dataset) => dataset.data))}
    />
  ),
}));

vi.mock("@/lib/theme/use-css-colors", () => ({
  useCssColors: (vars: string[]) => vars.map(() => "#000000"),
}));

describe("LineChart", () => {
  it("passes labels and each dataset's values through to the underlying chart", () => {
    render(
      <LineChart
        labels={["Jan", "Feb"]}
        datasets={[
          { label: "Grades", values: [70, 80], colorVar: "--color-primary" },
          { label: "Attendance", values: [90, 95], colorVar: "--color-info" },
        ]}
      />,
    );

    const chart = screen.getByTestId("line");
    expect(chart.dataset.labels).toBe(JSON.stringify(["Jan", "Feb"]));
    expect(chart.dataset.datasetLabels).toBe(
      JSON.stringify(["Grades", "Attendance"]),
    );
    expect(chart.dataset.values).toBe(
      JSON.stringify([
        [70, 80],
        [90, 95],
      ]),
    );
  });
});
