import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Title } from "./Title";

describe("Title", () => {
  it("renders as an h1 by default", () => {
    render(<Title>Hello</Title>);
    expect(screen.getByText("Hello").tagName).toBe("H1");
  });

  it("renders as the given element when as is provided", () => {
    render(<Title as="h3">Hello</Title>);
    expect(screen.getByText("Hello").tagName).toBe("H3");
  });

  it("merges a custom className", () => {
    render(<Title className="mt-2">Hello</Title>);
    expect(screen.getByText("Hello").className).toContain("mt-2");
  });
});
