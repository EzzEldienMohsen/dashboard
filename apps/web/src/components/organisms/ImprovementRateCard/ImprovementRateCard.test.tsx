import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImprovementRateCard } from "./ImprovementRateCard";

vi.mock("next-intl", () => ({
  useTranslations:
    () =>
    (key: string, values?: Record<string, unknown>) =>
      values ? `${key}:${JSON.stringify(values)}` : key,
}));

describe("ImprovementRateCard", () => {
  it("renders an upward indicator and the up-translation for a positive rate", () => {
    render(<ImprovementRateCard improvementRatePercentage={12} />);

    expect(screen.getByText("↑")).toBeInTheDocument();
    expect(screen.getByText("12%")).toBeInTheDocument();
    expect(
      screen.getByText('improvementRateUp:{"value":12}'),
    ).toBeInTheDocument();
  });

  it("renders a downward indicator and the down-translation for a negative rate", () => {
    render(<ImprovementRateCard improvementRatePercentage={-8} />);

    expect(screen.getByText("↓")).toBeInTheDocument();
    expect(screen.getByText("8%")).toBeInTheDocument();
    expect(
      screen.getByText('improvementRateDown:{"value":8}'),
    ).toBeInTheDocument();
  });

  it("renders a flat indicator and the flat-translation when there is no change", () => {
    render(<ImprovementRateCard improvementRatePercentage={0} />);

    expect(screen.getByText("→")).toBeInTheDocument();
    expect(screen.getByText("improvementRateFlat")).toBeInTheDocument();
  });
});
