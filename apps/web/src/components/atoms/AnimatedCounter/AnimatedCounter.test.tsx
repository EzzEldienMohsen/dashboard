import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnimatedCounter } from "./AnimatedCounter";

vi.mock("framer-motion", () => ({
  useInView: () => true,
}));

describe("AnimatedCounter", () => {
  beforeEach(() => {
    // Resolve the animation in a single synchronous frame by reporting a
    // timestamp far past the animation's duration.
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(1_000_000);
      return 0;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("counts up to the formatted target value once in view", () => {
    render(<AnimatedCounter value={1234} />);
    expect(screen.getByText("1,234")).toBeInTheDocument();
  });

  it("renders zero for a zero value", () => {
    render(<AnimatedCounter value={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
