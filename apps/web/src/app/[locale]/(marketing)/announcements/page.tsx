import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { MarketingPageTemplate } from "@/components/templates/MarketingPageTemplate";
import { AnnouncementsList } from "@/components/organisms/AnnouncementsList";
import { FadeInSection } from "@/components/atoms/FadeInSection";
import { getSchoolProfile, getAnnouncements } from "@/lib/api";
import { ANNOUNCEMENTS_FETCH_LIMIT } from "@/lib/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/lib/seo/JsonLd";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t, { name: schoolName }] = await Promise.all([
    getLocale(),
    getTranslations("announcements"),
    getSchoolProfile(),
  ]);
  return buildPageMetadata({
    title: t("metaTitle", { schoolName }),
    description: t("metaDescription", { schoolName }),
    path: "/announcements",
    locale,
  });
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
      <JsonLd data={jsonLd} />
      <MarketingPageTemplate
        hero={
          <FadeInSection delay={0}>
            <section className="py-16 text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-base-content">
                {t("hero.heading")}
              </h1>
            </section>
          </FadeInSection>
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
          <FadeInSection delay={0.1}>
            <AnnouncementsList announcements={announcements} />
          </FadeInSection>
        </Suspense>
      </MarketingPageTemplate>
    </>
  );
}
