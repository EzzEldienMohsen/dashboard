import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthPageTemplate } from "@/components/templates/AuthPageTemplate";
import { RegisterForm } from "@/components/organisms/RegisterForm";
import { registerAction } from "../actions";
import { initialAuthActionState } from "../action-state";
import { getCountryOptions } from "@/lib/countries";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.register");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: true, follow: true },
  };
}

export default async function RegisterPage() {
  const t = await getTranslations("auth.register");
  const countryOptions = getCountryOptions();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("metaTitle"),
    url: `${SITE_URL}/register`,
    isPartOf: {
      "@type": "WebSite",
      name: "School Dashboard",
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
