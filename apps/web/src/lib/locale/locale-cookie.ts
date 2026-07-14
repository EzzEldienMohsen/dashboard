import { DEFAULT_LOCALE, isLocale, type Locale } from "./locales";

export const LOCALE_COOKIE = "locale";
export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * Falls back to the default locale if the cookie is missing or holds a
 * value that no longer matches a supported locale (e.g. after a locale
 * was removed from LOCALES).
 */
export function resolveLocale(cookieValue: string | undefined): Locale {
  return isLocale(cookieValue) ? cookieValue : DEFAULT_LOCALE;
}
