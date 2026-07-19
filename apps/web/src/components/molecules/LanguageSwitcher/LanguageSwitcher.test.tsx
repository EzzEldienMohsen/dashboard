import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageSwitcher } from "./LanguageSwitcher";

const replace = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/about",
  useRouter: () => ({ replace }),
}));

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
}));

afterEach(() => {
  replace.mockClear();
});

describe("LanguageSwitcher", () => {
  it("renders a single icon button, not a select", () => {
    render(<LanguageSwitcher />);

    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("labels the button with the locale it will switch to", () => {
    render(<LanguageSwitcher />);

    expect(screen.getByRole("button")).toHaveAccessibleName(
      'switchTo:{"locale":"العربية"}',
    );
  });

  it("navigates to the same pathname under the other locale when clicked", () => {
    render(<LanguageSwitcher />);

    fireEvent.click(screen.getByRole("button"));

    expect(replace).toHaveBeenCalledWith("/about", { locale: "ar" });
  });
});
