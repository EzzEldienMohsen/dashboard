import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LogoMark } from "./LogoMark";

describe("LogoMark", () => {
  it("renders the ED mark and hides it from assistive tech", () => {
    render(<LogoMark />);
    const mark = screen.getByText("ED");
    expect(mark).toHaveAttribute("aria-hidden", "true");
  });
});
