import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsSection } from "./StatsSection";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

vi.mock("@/lib/api", () => ({
  getPublicStats: vi.fn().mockResolvedValue({
    schoolsCount: 12,
    studentsCount: 3400,
    teachersCount: 210,
  }),
}));

// StaggerContainer's `whileInView` and AnimatedCounter's `useInView` both rely
// on IntersectionObserver — report every observed element as intersecting
// immediately so the animated counters resolve to their target values.
beforeAll(() => {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "";
    readonly thresholds: ReadonlyArray<number> = [];
    constructor(private callback: IntersectionObserverCallback) {}
    observe(target: Element) {
      this.callback(
        [{ isIntersecting: true, target } as IntersectionObserverEntry],
        this,
      );
    }
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  window.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
});

beforeEach(() => {
  // Resolve AnimatedCounter's rAF loop in a single synchronous frame by
  // reporting a timestamp far past its animation duration.
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(1_000_000);
    return 0;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("StatsSection", () => {
  it("renders a StatCard for schools, students, and teachers with the fetched counts", async () => {
    render(await StatsSection());

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("3,400")).toBeInTheDocument();
    expect(screen.getByText("210")).toBeInTheDocument();

    expect(screen.getByText("schools")).toBeInTheDocument();
    expect(screen.getByText("students")).toBeInTheDocument();
    expect(screen.getByText("teachers")).toBeInTheDocument();
  });
});
