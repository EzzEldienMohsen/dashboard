import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RadialProgress } from "./RadialProgress";

describe("RadialProgress", () => {
  it("renders the value as the default label and sets the progressbar attributes", () => {
    render(<RadialProgress value={72} />);

    const progress = screen.getByRole("progressbar");
    expect(progress).toHaveTextContent("72%");
    expect(progress).toHaveAttribute("aria-valuenow", "72");
    expect(progress.style.getPropertyValue("--value")).toBe("72");
  });

  it("renders a custom label instead of the numeric value", () => {
    render(<RadialProgress value={72} label="Grade 4-A" />);

    expect(screen.getByRole("progressbar")).toHaveTextContent("Grade 4-A");
  });

  it("applies the given color class", () => {
    render(<RadialProgress value={90} colorClassName="text-success" />);

    expect(screen.getByRole("progressbar")).toHaveClass("text-success");
  });

  it("clamps out-of-range values into 0-100", () => {
    render(<RadialProgress value={150} />);

    const progress = screen.getByRole("progressbar");
    expect(progress).toHaveAttribute("aria-valuenow", "100");
    expect(progress).toHaveTextContent("100%");
  });
});
