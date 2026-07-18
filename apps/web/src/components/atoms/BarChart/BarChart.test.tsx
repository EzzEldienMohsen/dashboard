import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BarChart } from "./BarChart";

vi.mock("react-chartjs-2", () => ({
  Bar: (props: { data: { labels: string[]; datasets: { data: number[] }[] } }) => (
    <div
      data-testid="bar"
      data-labels={JSON.stringify(props.data.labels)}
      data-values={JSON.stringify(props.data.datasets[0].data)}
    />
  ),
}));

vi.mock("@/lib/theme/use-css-colors", () => ({
  useCssColors: (vars: string[]) => vars.map(() => "#000000"),
}));

describe("BarChart", () => {
  it("passes labels and values through to the underlying chart", () => {
    render(
      <BarChart
        labels={["Math", "Science"]}
        values={[85, 70]}
        colorVar="--color-primary"
      />,
    );

    const chart = screen.getByTestId("bar");
    expect(chart.dataset.labels).toBe(JSON.stringify(["Math", "Science"]));
    expect(chart.dataset.values).toBe(JSON.stringify([85, 70]));
  });
});
