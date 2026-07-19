import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StaggerContainer, StaggerItem } from "./Stagger";

// IntersectionObserver is polyfilled globally in vitest.setup.ts.

describe("StaggerContainer / StaggerItem", () => {
  it("renders all items", () => {
    render(
      <StaggerContainer>
        <StaggerItem>First</StaggerItem>
        <StaggerItem>Second</StaggerItem>
      </StaggerContainer>,
    );

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });
});
