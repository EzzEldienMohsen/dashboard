import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthPageTemplate } from "@/components/templates/AuthPageTemplate";
import { LoginForm } from "@/components/organisms/LoginForm";
import { loginAction } from "../actions";
import { initialAuthActionState } from "../action-state";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: true, follow: true },
  };
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
