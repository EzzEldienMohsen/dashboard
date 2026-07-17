import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { MarketingPageTemplate } from "@/components/templates/MarketingPageTemplate";
import { HeroSection } from "@/components/organisms/HeroSection";
import { StatsSection } from "@/components/organisms/StatsSection";
import { FeatureCardGrid } from "@/components/organisms/FeatureCardGrid";
import { AnnouncementsSection } from "@/components/organisms/AnnouncementsSection";
import { CTAStrip } from "@/components/organisms/CTAStrip";
import { getSchoolProfile, getPublicStats, getAnnouncements } from "@/lib/api";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  const { name: schoolName } = await getSchoolProfile();
  return {
    title: t("metaTitle", { schoolName }),
    description: t("metaDescription"),
    alternates: { canonical: "/" },
    openGraph: {
      title: t("metaTitle", { schoolName }),
      description: t("metaDescription"),
      type: "website",
      url: "/",
    },
  };
}

export default async function HomePage() {
  const t = await getTranslations("home");

  const [profile, stats, newsData] = await Promise.all([
    getSchoolProfile(),
    getPublicStats(),
    getAnnouncements(3),
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingPageTemplate
        hero={<HeroSection schoolName={profile.name} mission={profile.mission} />}
      >
        <Suspense fallback={<SectionSkeleton />}>
          <StatsSection {...stats} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <FeatureCardGrid variant="compact" />
        </Suspense>
        <div className="flex justify-end mb-4">
          <Link href="/features" className="link link-primary text-sm font-medium">
            {t("features.viewAll")}
          </Link>
        </div>
        <Suspense fallback={<SectionSkeleton />}>
          <AnnouncementsSection announcements={newsData.items} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <CTAStrip heading={t("cta.heading")} buttonLabel={t("cta.button")} />
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
