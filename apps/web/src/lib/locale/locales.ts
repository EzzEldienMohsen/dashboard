export type Locale = "en" | "ar";

export interface LocaleDefinition {
  code: Locale;
  label: string;
  dir: "ltr" | "rtl";
}

/**
 * Single source of truth for supported locales — consumed by the cookie
 * resolver, the proxy's Accept-Language negotiation, and next-intl's
 * request config. Adding a locale means adding an entry here plus a
 * matching messages/{locale}.json file.
 */
export const LOCALES: readonly LocaleDefinition[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
];

export const DEFAULT_LOCALE: Locale = "en";

const LOCALE_CODES = LOCALES.map((locale) => locale.code) as string[];

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && LOCALE_CODES.includes(value);
}

export function getLocaleDir(locale: Locale): "ltr" | "rtl" {
  return LOCALES.find((entry) => entry.code === locale)?.dir ?? "ltr";
}
