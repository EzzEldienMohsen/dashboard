import { getLocale } from "next-intl/server";

/**
 * `getLocale()` requires an active request context and throws when called
 * from `generateStaticParams` (which runs at build time with no request) —
 * callers there don't need localized content, so fall back to English.
 */
export async function isArabicLocale(): Promise<boolean> {
  try {
    return (await getLocale()) === "ar";
  } catch {
    return false;
  }
}

export function pickArabic(base: string, ar: string | null | undefined): string {
  return ar?.trim() ? ar : base;
}
