import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useCssColors } from "./use-css-colors";
import { useTheme } from "./theme-context";

vi.mock("./theme-context", () => ({
  useTheme: vi.fn(),
}));

const mockUseTheme = vi.mocked(useTheme);

function ColorProbe({ vars }: { vars: string[] }) {
  const colors = useCssColors(vars);
  return createElement("span", null, colors.join(","));
}

describe("useCssColors", () => {
  it("resolves each CSS custom property via getComputedStyle, trimmed", () => {
    mockUseTheme.mockReturnValue({ theme: "schoollight", toggleTheme: vi.fn() });
    const values: Record<string, string> = {
      "--color-success": " #22c55e ",
      "--color-error": " #ef4444 ",
    };
    const spy = vi.spyOn(window, "getComputedStyle").mockReturnValue({
      getPropertyValue: (name: string) => values[name] ?? "",
    } as CSSStyleDeclaration);

    render(createElement(ColorProbe, { vars: ["--color-success", "--color-error"] }));

    expect(screen.getByText("#22c55e,#ef4444")).toBeInTheDocument();

    spy.mockRestore();
  });

  it("re-resolves the computed value after the theme changes", () => {
    const values: Record<string, string> = { "--x": "light-value" };
    const spy = vi.spyOn(window, "getComputedStyle").mockImplementation(
      () =>
        ({
          getPropertyValue: (name: string) => values[name] ?? "",
        }) as CSSStyleDeclaration,
    );
    mockUseTheme.mockReturnValue({ theme: "schoollight", toggleTheme: vi.fn() });
    const vars = ["--x"];

    const { rerender } = render(createElement(ColorProbe, { vars }));
    expect(screen.getByText("light-value")).toBeInTheDocument();

    values["--x"] = "dark-value";
    mockUseTheme.mockReturnValue({ theme: "schooldark", toggleTheme: vi.fn() });
    rerender(createElement(ColorProbe, { vars }));

    expect(screen.getByText("dark-value")).toBeInTheDocument();

    spy.mockRestore();
  });
});
