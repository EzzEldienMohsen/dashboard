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
  useTranslations: () => (key: string) => key,
}));

afterEach(() => {
  replace.mockClear();
});

describe("LanguageSwitcher", () => {
  it("renders the active locale as the selected option", () => {
    render(<LanguageSwitcher />);

    expect(screen.getByRole("combobox")).toHaveValue("en");
  });

  it("navigates to the same pathname under the new locale when a different locale is picked", () => {
    render(<LanguageSwitcher />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "ar" } });

    expect(replace).toHaveBeenCalledWith("/about", { locale: "ar" });
  });

  it("does not navigate when re-selecting the already-active locale", () => {
    render(<LanguageSwitcher />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "en" } });

    expect(replace).not.toHaveBeenCalled();
  });
});
