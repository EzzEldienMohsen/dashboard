export type Locale = "en" | "ar";

export interface LocaleDefinition {
  code: Locale;
  label: string;
  dir: "ltr" | "rtl";
}

/**
 * Single source of truth for supported locales — consumed by i18n/routing.ts
 * (next-intl's defineRouting) and the LanguageSwitcher. Adding a locale
 * means adding an entry here plus a matching messages/{locale}.json file.
 */
export const LOCALES: readonly LocaleDefinition[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
];

export const DEFAULT_LOCALE: Locale = "en";

export function getLocaleDir(locale: Locale): "ltr" | "rtl" {
  return LOCALES.find((entry) => entry.code === locale)?.dir ?? "ltr";
}
