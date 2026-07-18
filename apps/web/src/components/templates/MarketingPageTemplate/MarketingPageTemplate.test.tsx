import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarketingPageTemplate } from "./MarketingPageTemplate";

describe("MarketingPageTemplate", () => {
  it("renders both the hero and children content", () => {
    render(
      <MarketingPageTemplate hero={<div>hero content</div>}>
        <div>below-the-fold content</div>
      </MarketingPageTemplate>,
    );

    expect(screen.getByText("hero content")).toBeInTheDocument();
    expect(screen.getByText("below-the-fold content")).toBeInTheDocument();
  });
});
