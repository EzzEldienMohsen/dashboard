"use server";

import { cookies } from "next/headers";
import { isLocale, type Locale } from "./locales";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE_SECONDS } from "./locale-cookie";

export async function setLocaleAction(locale: Locale): Promise<void> {
  if (!isLocale(locale)) return;

  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
  });
}
