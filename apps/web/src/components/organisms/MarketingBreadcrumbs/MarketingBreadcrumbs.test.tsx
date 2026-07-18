import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import * as Sentry from "@sentry/nextjs";
import { MarketingBreadcrumbs } from "./MarketingBreadcrumbs";

vi.mock("@sentry/nextjs", () => ({
  addBreadcrumb: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => "/",
}));

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: ObserverCallback;
  observe = vi.fn();
  disconnect = vi.fn();

  constructor(callback: ObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }
}

describe("MarketingBreadcrumbs", () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("renders a link for crumbs with an href and plain text for the current page", () => {
    render(
      <MarketingBreadcrumbs
        crumbs={[{ label: "Home", href: "/" }, { label: "Features" }]}
      />,
    );

    const link = screen.getByRole("link", { name: "Home" });
    expect(link).toHaveAttribute("href", "/");
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Features" })).not.toBeInTheDocument();

    // separator rendered before the second crumb only
    expect(screen.getAllByText("/", { selector: "span" })).toHaveLength(1);
  });

  it("sends a navigation breadcrumb to Sentry on mount with the joined crumb labels", () => {
    render(
      <MarketingBreadcrumbs
        crumbs={[{ label: "Home", href: "/" }, { label: "Features" }]}
      />,
    );

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      category: "navigation",
      message: "Home > Features",
      level: "info",
    });
  });

  it("sends a ui.click breadcrumb when a crumb link is clicked", () => {
    render(<MarketingBreadcrumbs crumbs={[{ label: "Home", href: "/" }]} />);

    fireEvent.click(screen.getByRole("link", { name: "Home" }));

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      category: "ui.click",
      message: "Breadcrumb clicked: Home",
      level: "info",
    });
  });

  it("does not observe anything when no sectionId is provided", () => {
    render(<MarketingBreadcrumbs crumbs={[{ label: "Home" }]} />);

    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it("sends a ui.view breadcrumb and disconnects once the tracked section intersects", () => {
    const section = document.createElement("div");
    section.id = "hero";
    document.body.appendChild(section);

    render(<MarketingBreadcrumbs crumbs={[{ label: "Home" }]} sectionId="hero" />);

    expect(MockIntersectionObserver.instances).toHaveLength(1);
    const observerInstance = MockIntersectionObserver.instances[0];
    expect(observerInstance.observe).toHaveBeenCalledWith(section);

    observerInstance.callback([{ isIntersecting: true }]);

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      category: "ui.view",
      message: "Section viewed: hero",
      level: "info",
    });
    expect(observerInstance.disconnect).toHaveBeenCalled();

    document.body.removeChild(section);
  });
});
