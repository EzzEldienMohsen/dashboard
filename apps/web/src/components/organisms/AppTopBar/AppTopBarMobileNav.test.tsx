import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AppTopBarMobileNav } from "./AppTopBarMobileNav";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => "/dashboard",
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("AppTopBarMobileNav", () => {
  it("is closed by default", () => {
    render(<AppTopBarMobileNav role="MANAGER" />);

    expect(screen.getByRole("button", { name: "openMenu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByRole("navigation", { name: "publicNavLabel" })).not.toBeInTheDocument();
  });

  it("opens the drawer with both the dashboard links and every public link for a MANAGER", () => {
    render(<AppTopBarMobileNav role="MANAGER" />);

    fireEvent.click(screen.getByRole("button", { name: "openMenu" }));

    expect(screen.getByRole("button", { name: "closeMenu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("navigation", { name: "sidebarLabel" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "overview" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: "classes" })).toHaveAttribute(
      "href",
      "/dashboard/classes",
    );
    expect(screen.getByRole("link", { name: "students" })).toHaveAttribute(
      "href",
      "/dashboard/students",
    );

    expect(screen.getByRole("navigation", { name: "publicNavLabel" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "features" })).toHaveAttribute("href", "/features");
    expect(screen.getByRole("link", { name: "about" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "announcements" })).toHaveAttribute(
      "href",
      "/announcements",
    );
  });

  it("hides the Manager-only overview link for a TEACHER", () => {
    render(<AppTopBarMobileNav role="TEACHER" />);

    fireEvent.click(screen.getByRole("button", { name: "openMenu" }));

    expect(screen.queryByRole("link", { name: "overview" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "classes" })).toBeInTheDocument();
  });

  it("closes the drawer again when the toggle is clicked a second time", async () => {
    render(<AppTopBarMobileNav role="MANAGER" />);

    const toggle = screen.getByRole("button", { name: "openMenu" });
    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole("button", { name: "closeMenu" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("navigation", { name: "publicNavLabel" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("closes the drawer when a nav link is clicked", async () => {
    render(<AppTopBarMobileNav role="MANAGER" />);

    fireEvent.click(screen.getByRole("button", { name: "openMenu" }));
    fireEvent.click(screen.getByRole("link", { name: "home" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("navigation", { name: "publicNavLabel" }),
      ).not.toBeInTheDocument(),
    );
  });
});
