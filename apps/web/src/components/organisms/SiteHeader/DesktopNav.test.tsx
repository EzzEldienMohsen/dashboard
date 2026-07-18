import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DesktopNav } from "./DesktopNav";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => "/",
}));

describe("DesktopNav", () => {
  it("renders a link for every configured nav item plus the get-started CTA", () => {
    render(<DesktopNav />);

    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    const links = screen.getAllByRole("link");

    expect(links).toHaveLength(5); // 4 NAV_LINKS + register CTA
    expect(nav).toContainElement(links[0]);

    expect(screen.getByRole("link", { name: "getStarted" })).toHaveAttribute(
      "href",
      "/register",
    );
    expect(screen.getByRole("link", { name: "home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "features" })).toHaveAttribute(
      "href",
      "/features",
    );
    expect(screen.getByRole("link", { name: "about" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "announcements" })).toHaveAttribute(
      "href",
      "/announcements",
    );
  });
});
