import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./theme-context";

vi.mock("./set-theme-action", () => ({
  setThemeAction: vi.fn().mockResolvedValue(undefined),
}));

function ThemeProbe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  );
}

describe("ThemeProvider / useTheme", () => {
  it("throws when useTheme is used outside a ThemeProvider", () => {
    const ThrowingComponent = () => {
      useTheme();
      return null;
    };
    expect(() => render(<ThrowingComponent />)).toThrow(
      "useTheme must be used within a ThemeProvider",
    );
  });

  it("renders the server-resolved initial theme", () => {
    render(
      <ThemeProvider initialTheme="schooldark">
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByRole("button")).toHaveTextContent("schooldark");
  });

  it("toggles to the opposite theme on click", () => {
    render(
      <ThemeProvider initialTheme="schoollight">
        <ThemeProbe />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveTextContent("schooldark");
  });
});
