"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "@/lib/theme/theme-context";
import { Button } from "@/components/atoms/Button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations("common.theme");
  const isDark = theme === "schooldark";

  return (
    <Button
      type="button"
      variant="ghost"
      className="w-auto p-2"
      aria-label={isDark ? t("switchToLight") : t("switchToDark")}
      onClick={toggleTheme}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="4" />
      <path
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <path d="M20.354 15.354A9 9 0 1 1 8.646 3.646a9.003 9.003 0 0 0 11.708 11.708z" />
    </svg>
  );
}
