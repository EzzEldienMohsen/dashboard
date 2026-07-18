import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { MarketingPageTemplate } from "@/components/templates/MarketingPageTemplate";
import { SchoolProfileSection } from "@/components/organisms/SchoolProfileSection";
import { CTAStrip } from "@/components/organisms/CTAStrip";
import { getSchoolProfile } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/lib/seo/JsonLd";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  const { name: schoolName } = await getSchoolProfile();
  return buildPageMetadata({
    title: t("metaTitle", { schoolName }),
    description: t("metaDescription", { schoolName }),
    path: "/about",
  });
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const profile = await getSchoolProfile();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: `About ${profile.name}`,
      url: "/about",
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: profile.name,
      description: profile.mission,
      foundingDate: String(profile.foundedYear),
      address: profile.address,
      email: profile.contactEmail,
      telephone: profile.contactPhone ?? undefined,
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <MarketingPageTemplate
        hero={
          <section className="py-20 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-base-content">
              {t("hero.heading", { schoolName: profile.name })}
            </h1>
          </section>
        }
      >
        <Suspense fallback={<div className="skeleton h-64 rounded-2xl" />}>
          <SchoolProfileSection profile={profile} />
        </Suspense>
        <Suspense fallback={<div className="skeleton h-48 rounded-2xl" />}>
          <CTAStrip
            heading={t("cta.heading", { schoolName: profile.name })}
            buttonLabel={t("cta.button")}
          />
        </Suspense>
      </MarketingPageTemplate>
    </>
  );
}
