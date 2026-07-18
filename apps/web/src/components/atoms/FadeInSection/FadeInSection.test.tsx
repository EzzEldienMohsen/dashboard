import { beforeAll, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FadeInSection } from "./FadeInSection";

// jsdom doesn't implement IntersectionObserver; framer-motion's
// `whileInView` viewport tracking requires it to be present to mount.
beforeAll(() => {
  if (typeof window !== "undefined" && !window.IntersectionObserver) {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root: Element | Document | null = null;
      readonly rootMargin: string = "";
      readonly thresholds: ReadonlyArray<number> = [];
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    }
    window.IntersectionObserver =
      MockIntersectionObserver;
  }
});

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
