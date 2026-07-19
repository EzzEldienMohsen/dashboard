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
  /** Overrides the root layout's generic Twitter card image for this page. */
  twitterImage?: string;
}

/**
 * Every marketing page needs the same title/description mirrored into
 * `alternates.canonical`/`alternates.languages` + `openGraph` + `twitter`
 * — this is that shape, built once. `alternates.languages` (hreflang) is
 * what makes each locale's content independently discoverable/indexable,
 * since the app uses locale-prefixed URLs rather than a single
 * cookie-only URL. The Twitter card mirrors title/description per page
 * (falling back to the root layout's generic card only for pages that
 * don't call this helper) rather than reusing one generic card everywhere.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  locale,
  type = "website",
  twitterImage,
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
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(twitterImage ? { images: [twitterImage] } : {}),
    },
  };
}
