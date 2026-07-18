import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PasswordInput } from "./PasswordInput";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("PasswordInput", () => {
  it("renders a password field by default", () => {
    render(<PasswordInput id="password" name="password" />);
    const input = document.getElementById("password") as HTMLInputElement;
    expect(input.type).toBe("password");
  });

  it("toggles to a visible text field and back when the toggle button is clicked", () => {
    render(<PasswordInput id="password" name="password" />);
    const input = document.getElementById("password") as HTMLInputElement;
    const showButton = screen.getByRole("button", { name: "showAriaLabel" });

    fireEvent.click(showButton);
    expect(input.type).toBe("text");
    const hideButton = screen.getByRole("button", { name: "hideAriaLabel" });
    expect(hideButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(hideButton);
    expect(input.type).toBe("password");
    expect(screen.getByRole("button", { name: "showAriaLabel" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("applies invalid styling and aria-invalid when invalid", () => {
    render(<PasswordInput id="password" name="password" invalid />);
    const input = document.getElementById("password") as HTMLInputElement;
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.className).toContain("border-error");
  });

  it("does not mark the field invalid by default", () => {
    render(<PasswordInput id="password" name="password" />);
    const input = document.getElementById("password") as HTMLInputElement;
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input.className).toContain("border-base-300");
  });
});
