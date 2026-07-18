import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SidebarNav } from "./SidebarNav";

vi.mock("next-intl/server", () => ({
  getTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/dashboard",
  Link: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("SidebarNav", () => {
  it("shows all three links for a MANAGER", async () => {
    render(await SidebarNav({ role: "MANAGER" }));

    expect(screen.getByRole("link", { name: "overview" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "classes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "students" })).toBeInTheDocument();
  });

  it("hides the overview (Manager-only) link for a TEACHER", async () => {
    render(await SidebarNav({ role: "TEACHER" }));

    expect(screen.queryByRole("link", { name: "overview" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "classes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "students" })).toBeInTheDocument();
  });
});
