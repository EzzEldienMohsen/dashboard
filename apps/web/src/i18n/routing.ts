import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/locale/locales";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE_SECONDS } from "@/lib/locale/locale-cookie";

/**
 * Single routing config shared by proxy.ts (createMiddleware) and
 * navigation.ts (createNavigation) — locales/defaultLocale stay sourced
 * from lib/locale/locales.ts so that file remains the one place a new
 * locale is registered.
 */
export const routing = defineRouting({
  locales: LOCALES.map((locale) => locale.code) as [Locale, ...Locale[]],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
  localeCookie: {
    name: LOCALE_COOKIE,
    maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
  },
});
