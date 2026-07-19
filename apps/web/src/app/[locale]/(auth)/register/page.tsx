import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AuthPageTemplate } from "@/components/templates/AuthPageTemplate";
import { RegisterForm } from "@/components/organisms/RegisterForm";
import { registerAction } from "../actions";
import { initialAuthActionState } from "../action-state";
import { getCountryOptions } from "@/lib/countries";
import { getSchoolProfile } from "@/lib/api";
import { SITE_URL } from "@/lib/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("auth.register")]);
  return buildPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/register",
    locale,
  });
}

export default async function RegisterPage() {
  const [locale, t, { name: schoolName }] = await Promise.all([
    getLocale(),
    getTranslations("auth.register"),
    getSchoolProfile(),
  ]);
  const countryOptions = getCountryOptions(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("metaTitle"),
    url: `${SITE_URL}/register`,
    isPartOf: {
      "@type": "WebSite",
      name: schoolName,
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AuthPageTemplate
        title={t("title")}
        subtitle={t("subtitle")}
        footerSlot={
          <>
            {t("haveAccount")}{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {t("logIn")}
            </Link>
          </>
        }
      >
        <RegisterForm
          action={registerAction}
          initialState={initialAuthActionState}
          countryOptions={countryOptions}
        />
      </AuthPageTemplate>
    </>
  );
}
