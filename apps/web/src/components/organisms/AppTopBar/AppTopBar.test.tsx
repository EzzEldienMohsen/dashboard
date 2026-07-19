import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AppTopBar } from "./AppTopBar";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ replace: vi.fn() }),
  Link: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/theme/theme-context", () => ({
  useTheme: () => ({ theme: "schoollight", toggleTheme: vi.fn() }),
}));

describe("AppTopBar", () => {
  it("renders the user email and translated role label", async () => {
    const logoutAction = vi.fn();

    render(
      await AppTopBar({ userEmail: "teacher@example.com", role: "TEACHER", logoutAction }),
    );

    expect(screen.getByText(/teacher@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/roleTeacher/)).toBeInTheDocument();
    expect(screen.queryByText(/TEACHER/)).not.toBeInTheDocument();
  });

  it("translates the manager role label", async () => {
    const logoutAction = vi.fn();

    render(await AppTopBar({ userEmail: "a@b.com", role: "MANAGER", logoutAction }));

    expect(screen.getByText(/roleManager/)).toBeInTheDocument();
  });

  it("renders links to every public marketing page", async () => {
    const logoutAction = vi.fn();

    render(await AppTopBar({ userEmail: "a@b.com", role: "MANAGER", logoutAction }));

    expect(screen.getByRole("link", { name: "home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "features" })).toHaveAttribute("href", "/features");
    expect(screen.getByRole("link", { name: "about" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "announcements" })).toHaveAttribute(
      "href",
      "/announcements",
    );
  });

  it("renders the language switcher and theme toggle controls", async () => {
    const logoutAction = vi.fn();

    render(await AppTopBar({ userEmail: "a@b.com", role: "MANAGER", logoutAction }));

    expect(screen.getByRole("button", { name: "switchTo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "switchToDark" })).toBeInTheDocument();
  });

  it("wires the logout form to the injected logoutAction", async () => {
    const logoutAction = vi.fn().mockResolvedValue(undefined);

    render(await AppTopBar({ userEmail: "a@b.com", role: "MANAGER", logoutAction }));

    fireEvent.click(screen.getByRole("button", { name: "logout" }));

    await waitFor(() => expect(logoutAction).toHaveBeenCalledTimes(1));
  });
});
