import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/locale/locales";

interface BuildPageMetadataArgs {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  type?: "website" | "article";
}

/**
 * Every marketing page needs the same title/description mirrored into
 * `alternates.canonical`/`alternates.languages` + `openGraph` — this is
 * that shape, built once. `alternates.languages` (hreflang) is what makes
 * each locale's content independently discoverable/indexable, since the
 * app uses locale-prefixed URLs rather than a single cookie-only URL.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  locale,
  type = "website",
}: BuildPageMetadataArgs): Metadata {
  const localizedPath = getPathname({ locale, href: path });
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, getPathname({ locale: l, href: path })]),
  );

  return {
    title,
    description,
    alternates: { canonical: localizedPath, languages },
    openGraph: { title, description, type, url: localizedPath },
  };
}
