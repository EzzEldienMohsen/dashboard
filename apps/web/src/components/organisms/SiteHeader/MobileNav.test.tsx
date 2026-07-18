import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MobileNav } from "./MobileNav";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => "/",
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("MobileNav", () => {
  it("is closed by default", () => {
    render(<MobileNav />);

    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(
      screen.queryByRole("navigation", { name: "Mobile navigation" }),
    ).not.toBeInTheDocument();
  });

  it("opens the drawer with the nav links when the toggle is clicked", () => {
    render(<MobileNav />);

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("navigation", { name: "Mobile navigation" })).toBeInTheDocument();
    expect(screen.getByText("home")).toBeInTheDocument();
    expect(screen.getByText("getStarted")).toBeInTheDocument();
  });

  it("closes the drawer again when the toggle is clicked a second time", async () => {
    render(<MobileNav />);

    const toggle = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("navigation", { name: "Mobile navigation" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("closes the drawer when a nav link is clicked", async () => {
    render(<MobileNav />);

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.click(screen.getByText("home"));

    await waitFor(() =>
      expect(
        screen.queryByRole("navigation", { name: "Mobile navigation" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("closes the drawer when the Get Started link is clicked", async () => {
    render(<MobileNav />);

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.click(screen.getByText("getStarted"));

    await waitFor(() =>
      expect(
        screen.queryByRole("navigation", { name: "Mobile navigation" }),
      ).not.toBeInTheDocument(),
    );
  });
});
