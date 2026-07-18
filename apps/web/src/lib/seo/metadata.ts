import type { Metadata } from "next";

interface BuildPageMetadataArgs {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}

/**
 * Every marketing page needs the same title/description mirrored into
 * `alternates.canonical` + `openGraph` — this is that shape, built once.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  type = "website",
}: BuildPageMetadataArgs): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, type, url: path },
  };
}
