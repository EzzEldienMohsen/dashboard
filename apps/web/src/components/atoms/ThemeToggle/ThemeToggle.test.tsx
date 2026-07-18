import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "@/lib/theme/theme-context";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/lib/theme/theme-context", () => ({
  useTheme: vi.fn(),
}));

const mockUseTheme = vi.mocked(useTheme);

describe("ThemeToggle", () => {
  it("shows the switchToDark label and moon icon when the theme is light", () => {
    const toggleTheme = vi.fn();
    mockUseTheme.mockReturnValue({ theme: "schoollight", toggleTheme });

    render(<ThemeToggle />);

    expect(screen.getByRole("button", { name: "switchToDark" })).toBeInTheDocument();
  });

  it("shows the switchToLight label when the theme is dark and calls toggleTheme on click", () => {
    const toggleTheme = vi.fn();
    mockUseTheme.mockReturnValue({ theme: "schooldark", toggleTheme });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "switchToLight" });
    fireEvent.click(button);

    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });
});
