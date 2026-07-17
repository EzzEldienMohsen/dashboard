import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { MarketingPageTemplate } from "@/components/templates/MarketingPageTemplate";
import { AnnouncementsList } from "@/components/organisms/AnnouncementsList";
import { getSchoolProfile, getAnnouncements } from "@/lib/api";
import { ANNOUNCEMENTS_FETCH_LIMIT } from "@/lib/config/site";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("announcements");
  const { name: schoolName } = await getSchoolProfile();
  return {
    title: t("metaTitle", { schoolName }),
    description: t("metaDescription", { schoolName }),
    alternates: { canonical: "/announcements" },
    openGraph: {
      title: t("metaTitle", { schoolName }),
      description: t("metaDescription", { schoolName }),
      type: "website",
      url: "/announcements",
    },
  };
}

export default async function AnnouncementsPage() {
  const t = await getTranslations("announcements");
  const { items: announcements } = await getAnnouncements(ANNOUNCEMENTS_FETCH_LIMIT);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Announcements",
    url: "/announcements",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingPageTemplate
        hero={
          <section className="py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-base-content">
              {t("hero.heading")}
            </h1>
          </section>
        }
      >
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-40 rounded-2xl" />
              ))}
            </div>
          }
        >
          <AnnouncementsList announcements={announcements} />
        </Suspense>
      </MarketingPageTemplate>
    </>
  );
}
