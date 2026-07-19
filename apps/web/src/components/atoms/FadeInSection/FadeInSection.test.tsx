import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FadeInSection } from "./FadeInSection";

// IntersectionObserver is polyfilled globally in vitest.setup.ts.

describe("FadeInSection", () => {
  it("renders its children", () => {
    render(
      <FadeInSection>
        <p>Content</p>
      </FadeInSection>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders its children when a delay is provided", () => {
    render(
      <FadeInSection delay={0.3}>
        <p>Delayed content</p>
      </FadeInSection>,
    );
    expect(screen.getByText("Delayed content")).toBeInTheDocument();
  });
});
