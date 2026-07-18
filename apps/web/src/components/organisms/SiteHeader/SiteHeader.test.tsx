import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteHeader } from "./SiteHeader";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/molecules/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher" />,
}));

vi.mock("@/components/atoms/ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

vi.mock("./SiteHeaderNav", () => ({
  SiteHeaderNav: () => <nav data-testid="site-header-nav" />,
}));

describe("SiteHeader", () => {
  it("links the logo to home with an accessible label built from the school name", () => {
    render(<SiteHeader schoolName="Riverside School" />);

    const homeLink = screen.getByRole("link", { name: "Riverside School home" });
    expect(homeLink).toHaveAttribute("href", "/");
    expect(screen.getByText("Riverside School")).toBeInTheDocument();
  });

  it("renders the nav, language switcher, and theme toggle", () => {
    render(<SiteHeader schoolName="Riverside School" />);

    expect(screen.getByTestId("site-header-nav")).toBeInTheDocument();
    expect(screen.getByTestId("language-switcher")).toBeInTheDocument();
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
  });
});
