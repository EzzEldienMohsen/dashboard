import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CTAStrip } from "./CTAStrip";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => "/",
}));

describe("CTAStrip", () => {
  it("renders the heading and a register link with the button label", () => {
    render(<CTAStrip heading="Ready to get started?" buttonLabel="Sign up now" />);

    expect(screen.getByRole("heading", { name: "Ready to get started?" })).toBeInTheDocument();

    const link = screen.getByRole("link", { name: "Sign up now" });
    expect(link).toHaveAttribute("href", "/register");
  });
});
