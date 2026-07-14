import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/locale/locales";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/locale/locale-cookie";

const SUPPORTED_CODES = LOCALES.map((locale) => locale.code) as string[];

/**
 * Only acts on a visitor's very first request (no locale cookie yet) —
 * negotiates Accept-Language so the server can render the right language
 * from byte one. Once the cookie exists, next-intl's request config reads
 * it directly and this proxy is a no-op pass-through.
 */
export function proxy(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  if (request.cookies.has(LOCALE_COOKIE)) {
    return response;
  }

  const locale = negotiateLocale(request.headers.get("accept-language"));
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
  });

  return response;
}

function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, qValue] = part.trim().split(";q=");
      return {
        tag: tag.split("-")[0].toLowerCase(),
        quality: qValue ? parseFloat(qValue) : 1,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  const match = ranked.find((entry) => SUPPORTED_CODES.includes(entry.tag));
  return (match?.tag as Locale | undefined) ?? DEFAULT_LOCALE;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
