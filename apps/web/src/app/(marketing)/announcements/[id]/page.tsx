import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { MarketingBreadcrumbs } from "@/components/organisms/MarketingBreadcrumbs";
import { getAnnouncements, getAnnouncementById } from "@/lib/api";
import { getCategoryBadgeClass } from "@/lib/announcements/category";
import { ANNOUNCEMENTS_FETCH_LIMIT } from "@/lib/config/site";

export const revalidate = 3600;

export async function generateStaticParams(): Promise<{ id: string }[]> {
  const { items } = await getAnnouncements(ANNOUNCEMENTS_FETCH_LIMIT);
  return items.map((a) => ({ id: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const announcement = await getAnnouncementById(id);
  if (!announcement) return { title: "Announcement" };
  const description = announcement.body.slice(0, 160).trimEnd();
  return {
    title: announcement.title,
    description,
    alternates: { canonical: `/announcements/${id}` },
    openGraph: {
      title: announcement.title,
      description,
      type: "article",
      url: `/announcements/${id}`,
    },
  };
}

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("announcementDetail");
  const tAnn = await getTranslations("announcements");

  const announcement = await getAnnouncementById(id);

  if (!announcement) {
    notFound();
  }

  const badgeClass = getCategoryBadgeClass(announcement.category);
  const date = new Date(announcement.publishedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: announcement.title,
      datePublished: announcement.publishedAt,
      url: `/announcements/${announcement.id}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "/" },
        { "@type": "ListItem", position: 2, name: tAnn("hero.heading"), item: "/announcements" },
        { "@type": "ListItem", position: 3, name: announcement.title },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="w-[90%] max-w-3xl mx-auto py-12">
        <MarketingBreadcrumbs
          crumbs={[
            { label: "Home", href: "/" },
            { label: tAnn("hero.heading"), href: "/announcements" },
            { label: announcement.title },
          ]}
        />

        <article>
          <header className="mb-8 flex flex-col gap-4">
            <span className={`badge badge-sm w-fit ${badgeClass}`}>
              {tAnn(`categories.${announcement.category}` as Parameters<typeof tAnn>[0])}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-base-content leading-tight">
              {announcement.title}
            </h1>
            <time className="text-sm text-base-content/50">
              {t("publishedOn", { date })}
            </time>
          </header>

          <div className="prose prose-base max-w-none text-base-content/80 leading-relaxed whitespace-pre-wrap">
            {announcement.body}
          </div>
        </article>

        <div className="mt-10 border-t border-base-300 pt-6">
          <Link href="/announcements" className="link link-primary text-sm font-medium">
            {t("backToList")}
          </Link>
        </div>
      </div>
    </>
  );
}
