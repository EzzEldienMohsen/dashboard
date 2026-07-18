import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HowItWorksSection } from "./HowItWorksSection";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

describe("HowItWorksSection", () => {
  it("renders the heading and all 3 numbered steps", async () => {
    render(await HowItWorksSection());

    expect(screen.getByText("heading")).toBeInTheDocument();

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    for (let i = 0; i < 3; i++) {
      expect(screen.getByText(`steps.${i}.title`)).toBeInTheDocument();
      expect(screen.getByText(`steps.${i}.desc`)).toBeInTheDocument();
    }
  });
});
