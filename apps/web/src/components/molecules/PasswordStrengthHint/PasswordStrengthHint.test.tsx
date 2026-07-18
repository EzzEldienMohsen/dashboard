import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PasswordStrengthHint } from "./PasswordStrengthHint";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("PasswordStrengthHint", () => {
  it("shows all four rules as unmet for an empty password", () => {
    render(<PasswordStrengthHint password="" />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
    items.forEach((item) => {
      expect(item).toHaveTextContent("○");
      expect(item.className).not.toContain("text-success");
    });
  });

  it("marks all rules as met for a password satisfying every rule", () => {
    render(<PasswordStrengthHint password="Aa123456" />);
    const items = screen.getAllByRole("listitem");
    items.forEach((item) => {
      expect(item).toHaveTextContent("✓");
      expect(item.className).toContain("text-success");
    });
  });

  it("marks only the satisfied rules for a partially valid password", () => {
    render(<PasswordStrengthHint password="short" />);
    const [length, upper, lower, digit] = screen.getAllByRole("listitem");

    expect(length).toHaveTextContent("○"); // 5 chars, needs 8+
    expect(upper).toHaveTextContent("○"); // no uppercase letter
    expect(lower).toHaveTextContent("✓"); // has a lowercase letter
    expect(digit).toHaveTextContent("○"); // no digit
  });
});
