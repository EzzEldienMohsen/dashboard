import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DoughnutChart } from "./DoughnutChart";

// jsdom has no real <canvas> 2D context, so react-chartjs-2 (which needs
// one) is stubbed at the boundary — this asserts our wrapper computes the
// right Chart.js data shape, not that Chart.js itself can paint a canvas.
vi.mock("react-chartjs-2", () => ({
  Doughnut: (props: { data: { labels: string[]; datasets: { data: number[] }[] } }) => (
    <div
      data-testid="doughnut"
      data-labels={JSON.stringify(props.data.labels)}
      data-values={JSON.stringify(props.data.datasets[0].data)}
    />
  ),
}));

vi.mock("@/lib/theme/use-css-colors", () => ({
  useCssColors: (vars: string[]) => vars.map(() => "#000000"),
}));

describe("DoughnutChart", () => {
  it("passes labels and values through to the underlying chart", () => {
    render(
      <DoughnutChart
        labels={["Present", "Absent"]}
        values={[8, 2]}
        colorVars={["--color-success", "--color-error"]}
      />,
    );

    const chart = screen.getByTestId("doughnut");
    expect(chart.dataset.labels).toBe(JSON.stringify(["Present", "Absent"]));
    expect(chart.dataset.values).toBe(JSON.stringify([8, 2]));
  });
});
