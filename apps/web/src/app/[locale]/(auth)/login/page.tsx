import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AuthPageTemplate } from "@/components/templates/AuthPageTemplate";
import { LoginForm } from "@/components/organisms/LoginForm";
import { loginAction } from "../actions";
import { initialAuthActionState } from "../action-state";
import { SITE_URL } from "@/lib/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("auth.login")]);
  return buildPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/login",
    locale,
  });
}

export default async function LoginPage() {
  const t = await getTranslations("auth.login");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("metaTitle"),
    url: `${SITE_URL}/login`,
    isPartOf: {
      "@type": "WebSite",
      name: "Campus Dashboard",
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
            {t("noAccount")}{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              {t("createAccount")}
            </Link>
          </>
        }
      >
        <LoginForm action={loginAction} initialState={initialAuthActionState} />
      </AuthPageTemplate>
    </>
  );
}
