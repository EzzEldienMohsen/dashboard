"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/atoms/Button";
import { LOCALES, type Locale } from "@/lib/locale/locales";
import { cn } from "@/lib/cn";

/**
 * Locale is part of the URL, so switching navigates to the same pathname
 * under the other locale prefix — next-intl's router persists the choice
 * to the locale cookie as part of that navigation. Only 2 locales exist,
 * so this is a direct icon-button toggle (like ThemeToggle), not a dropdown.
 */
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common.language");
  const [isPending, startTransition] = useTransition();

  const nextLocale: Locale = locale === "en" ? "ar" : "en";
  const nextLabel = LOCALES.find((entry) => entry.code === nextLocale)?.label ?? nextLocale;

  function handleClick() {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className={cn("w-auto p-2", isPending && "opacity-60")}
      aria-label={t("switchTo", { locale: nextLabel })}
      disabled={isPending}
      onClick={handleClick}
    >
      <GlobeIcon />
    </Button>
  );
}

function GlobeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        strokeLinecap="round"
        d="M3 12h18M12 3c2.5 2.7 4 6.2 4 9s-1.5 6.3-4 9c-2.5-2.7-4-6.2-4-9s1.5-6.3 4-9Z"
      />
    </svg>
  );
}
