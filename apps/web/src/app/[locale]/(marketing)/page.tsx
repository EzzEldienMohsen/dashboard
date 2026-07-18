import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { MarketingPageTemplate } from "@/components/templates/MarketingPageTemplate";
import { HeroSection } from "@/components/organisms/HeroSection";
import { StatsSection } from "@/components/organisms/StatsSection";
import { FeatureCardGrid } from "@/components/organisms/FeatureCardGrid";
import { AnnouncementsSection } from "@/components/organisms/AnnouncementsSection";
import { CTAStrip } from "@/components/organisms/CTAStrip";
import { FadeInSection } from "@/components/atoms/FadeInSection";
import { getAnnouncements, getSchoolProfile } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/lib/seo/JsonLd";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t, { name: schoolName }] = await Promise.all([
    getLocale(),
    getTranslations("home"),
    getSchoolProfile(),
  ]);
  return buildPageMetadata({
    title: t("metaTitle", { schoolName }),
    description: t("metaDescription"),
    path: "/",
    locale,
  });
}

export default async function HomePage() {
  const [t, profile] = await Promise.all([
    getTranslations("home"),
    getSchoolProfile(),
  ]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: profile.name,
      url: "/",
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: profile.name,
      description: profile.mission,
      url: "/",
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <MarketingPageTemplate
        hero={<HeroSection schoolName={profile.name} mission={profile.mission} />}
      >
        <Suspense fallback={<SectionSkeleton />}>
          <FadeInSection delay={0}><StatsSection /></FadeInSection>
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <FadeInSection delay={0.1}><FeatureCardGrid variant="compact" /></FadeInSection>
        </Suspense>
        <FadeInSection delay={0.2}>
          <div className="flex justify-end mb-4">
            <Link href="/features" className="link link-primary text-sm font-medium">
              {t("features.viewAll")}
            </Link>
          </div>
        </FadeInSection>
        <Suspense fallback={<SectionSkeleton />}>
          <FadeInSection delay={0.2}>
            <AnnouncementsSection limit={3} fetchAnnouncements={getAnnouncements} />
          </FadeInSection>
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <FadeInSection delay={0.3}><CTAStrip heading={t("cta.heading")} buttonLabel={t("cta.button")} /></FadeInSection>
        </Suspense>
      </MarketingPageTemplate>
    </>
  );
}

function SectionSkeleton() {
  return (
    <div className="py-16">
      <div className="skeleton h-8 w-48 mb-6 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
