"use client";

import { useTransition, type ChangeEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Select } from "@/components/atoms/Select";
import { Label } from "@/components/atoms/Label";
import { LOCALES, type Locale } from "@/lib/locale/locales";
import { cn } from "@/lib/cn";

const OPTIONS = LOCALES.map((locale) => ({
  value: locale.code,
  label: locale.label,
}));

/**
 * Locale is now part of the URL, so switching navigates to the same
 * pathname under the new locale prefix — next-intl's router also persists
 * the choice to the locale cookie as part of that navigation. useTransition
 * keeps the select responsive with a pending state instead of freezing input.
 */
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common.language");
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as Locale;
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className={cn(isPending && "opacity-60")}>
      <Label htmlFor="language-switcher" className="sr-only">
        {t("label")}
      </Label>
      <Select
        id="language-switcher"
        name="language"
        options={OPTIONS}
        value={locale}
        disabled={isPending}
        onChange={handleChange}
      />
    </div>
  );
}
