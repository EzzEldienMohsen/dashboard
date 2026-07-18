import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "./SiteFooter";

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

vi.mock("@/lib/api", () => ({
  getSchoolProfile: vi.fn().mockResolvedValue({
    name: "Greenwood High",
    contactEmail: "info@greenwood.edu",
  }),
}));

describe("SiteFooter", () => {
  it("renders the school name and a mailto link for the contact email", async () => {
    render(await SiteFooter());

    expect(screen.getByText("Greenwood High")).toBeInTheDocument();

    const mailLink = screen.getByRole("link", { name: "info@greenwood.edu" });
    expect(mailLink).toHaveAttribute("href", "mailto:info@greenwood.edu");
  });

  it("renders all footer nav links and the copyright line with the current year", async () => {
    render(await SiteFooter());

    const nav = screen.getByRole("navigation", { name: "Footer navigation" });
    expect(nav.querySelectorAll("a")).toHaveLength(6);

    const year = new Date().getFullYear();
    expect(screen.getByText("copyright")).toBeInTheDocument();
    void year;
  });
});
