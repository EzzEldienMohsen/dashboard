"use client";

import { useTransition, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Select } from "@/components/atoms/Select";
import { Label } from "@/components/atoms/Label";
import { LOCALES, type Locale } from "@/lib/locale/locales";
import { setLocaleAction } from "@/lib/locale/set-locale-action";
import { cn } from "@/lib/cn";

const OPTIONS = LOCALES.map((locale) => ({
  value: locale.code,
  label: locale.label,
}));

/**
 * Unlike theme, changing locale re-renders server-rendered translated
 * text, so it genuinely needs a round-trip (setLocaleAction + refresh)
 * instead of an optimistic client update. useTransition keeps the select
 * responsive with a pending state rather than freezing input.
 */
export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("common.language");
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as Locale;
    if (next === locale) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
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
