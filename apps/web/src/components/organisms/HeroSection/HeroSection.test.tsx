import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "./HeroSection";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => "/",
}));

describe("HeroSection", () => {
  it("renders the school name, mission, and both CTA links", async () => {
    render(
      await HeroSection({ schoolName: "Greenwood High", mission: "Empowering minds." }),
    );

    expect(screen.getByRole("heading", { name: "Greenwood High" })).toBeInTheDocument();
    expect(screen.getByText("Empowering minds.")).toBeInTheDocument();

    const registerLink = screen.getByRole("link", { name: "ctaStart" });
    expect(registerLink).toHaveAttribute("href", "/register");

    const loginLink = screen.getByRole("link", { name: "ctaLogin" });
    expect(loginLink).toHaveAttribute("href", "/login");
  });
});
