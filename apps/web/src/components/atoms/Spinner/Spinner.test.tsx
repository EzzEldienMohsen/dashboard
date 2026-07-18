import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("renders an svg hidden from assistive tech with the spin animation class", () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg?.getAttribute("class")).toContain("animate-spin");
  });

  it("merges a custom className", () => {
    const { container } = render(<Spinner className="text-error" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toContain("text-error");
  });
});
