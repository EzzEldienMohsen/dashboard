import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HoverTiltCard } from "./HoverTiltCard";

describe("HoverTiltCard", () => {
  it("renders its children", () => {
    render(
      <HoverTiltCard>
        <p>Card content</p>
      </HoverTiltCard>,
    );

    expect(screen.getByText("Card content")).toBeInTheDocument();
  });
});
