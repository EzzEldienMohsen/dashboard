import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Subtitle } from "./Subtitle";

describe("Subtitle", () => {
  it("renders as a paragraph by default", () => {
    render(<Subtitle>Hello</Subtitle>);
    const el = screen.getByText("Hello");
    expect(el.tagName).toBe("P");
  });

  it("renders as the given element when as is provided", () => {
    render(<Subtitle as="h2">Hello</Subtitle>);
    expect(screen.getByText("Hello").tagName).toBe("H2");
  });

  it("merges a custom className", () => {
    render(<Subtitle className="mt-2">Hello</Subtitle>);
    expect(screen.getByText("Hello").className).toContain("mt-2");
  });
});
