import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { MarketingPageTemplate } from "@/components/templates/MarketingPageTemplate";
import { FeatureCardGrid } from "@/components/organisms/FeatureCardGrid";
import { HowItWorksSection } from "@/components/organisms/HowItWorksSection";
import { CTAStrip } from "@/components/organisms/CTAStrip";
import { getSchoolProfile } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/lib/seo/JsonLd";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t, { name: schoolName }] = await Promise.all([
    getLocale(),
    getTranslations("features"),
    getSchoolProfile(),
  ]);
  return buildPageMetadata({
    title: t("metaTitle", { schoolName }),
    description: t("metaDescription"),
    path: "/features",
    locale,
  });
}

export default async function FeaturesPage() {
  const t = await getTranslations("features");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Features",
    url: "/features",
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <MarketingPageTemplate
        hero={
          <section className="py-20 md:py-32 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-base-content leading-tight mb-6">
              {t("hero.heading")}
            </h1>
            <p className="text-lg text-base-content/60 max-w-2xl mx-auto leading-relaxed">
              {t("hero.sub")}
            </p>
          </section>
        }
      >
        <Suspense fallback={<GridSkeleton />}>
          <FeatureCardGrid variant="full" />
        </Suspense>
        <Suspense fallback={<div className="skeleton h-48 rounded-2xl" />}>
          <HowItWorksSection />
        </Suspense>
        <Suspense fallback={<div className="skeleton h-48 rounded-2xl" />}>
          <CTAStrip heading={t("cta.heading")} buttonLabel={t("cta.button")} />
        </Suspense>
      </MarketingPageTemplate>
    </>
  );
}

function GridSkeleton() {
  return (
    <div className="py-16">
      <div className="skeleton h-8 w-48 mb-8 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-40 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
