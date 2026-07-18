import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeatureCardGrid } from "./FeatureCardGrid";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

describe("FeatureCardGrid", () => {
  it("renders 3 items for the compact variant", async () => {
    render(await FeatureCardGrid({ variant: "compact" }));

    expect(screen.getByText("heading")).toBeInTheDocument();
    expect(screen.getByText("items.0.title")).toBeInTheDocument();
    expect(screen.getByText("items.1.title")).toBeInTheDocument();
    expect(screen.getByText("items.2.title")).toBeInTheDocument();
    expect(screen.queryByText("items.3.title")).not.toBeInTheDocument();
  });

  it("renders 6 items for the full variant", async () => {
    render(await FeatureCardGrid({ variant: "full" }));

    for (let i = 0; i < 6; i++) {
      expect(screen.getByText(`items.${i}.title`)).toBeInTheDocument();
      expect(screen.getByText(`items.${i}.desc`)).toBeInTheDocument();
    }
  });
});
