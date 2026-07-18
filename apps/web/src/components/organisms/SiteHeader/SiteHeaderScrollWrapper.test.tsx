import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SiteHeaderScrollWrapper } from "./SiteHeaderScrollWrapper";

function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", {
    value,
    configurable: true,
    writable: true,
  });
}

describe("SiteHeaderScrollWrapper", () => {
  it("renders without the scrolled styling before any scroll happens", () => {
    setScrollY(0);
    render(
      <SiteHeaderScrollWrapper>
        <span>content</span>
      </SiteHeaderScrollWrapper>,
    );

    const header = screen.getByText("content").closest("header");
    expect(header).toHaveClass("bg-base-100");
    expect(header).not.toHaveClass("backdrop-blur-md");
  });

  it("applies the scrolled styling once scrollY passes the 10px threshold", () => {
    setScrollY(0);
    render(
      <SiteHeaderScrollWrapper>
        <span>content</span>
      </SiteHeaderScrollWrapper>,
    );

    setScrollY(20);
    fireEvent.scroll(window);

    const header = screen.getByText("content").closest("header");
    expect(header).toHaveClass("backdrop-blur-md");
    expect(header).toHaveClass("bg-base-100/80");
  });

  it("removes the scrolled styling again once scrolled back above the threshold", () => {
    setScrollY(20);
    render(
      <SiteHeaderScrollWrapper>
        <span>content</span>
      </SiteHeaderScrollWrapper>,
    );
    fireEvent.scroll(window);

    setScrollY(0);
    fireEvent.scroll(window);

    const header = screen.getByText("content").closest("header");
    expect(header).not.toHaveClass("backdrop-blur-md");
    expect(header).toHaveClass("bg-base-100");
  });
});
