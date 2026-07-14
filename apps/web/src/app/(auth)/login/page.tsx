import type { Metadata } from "next";
import Link from "next/link";
import { AuthPageTemplate } from "@/components/templates/AuthPageTemplate";
import { LoginForm } from "@/components/organisms/LoginForm";
import { loginAction } from "../actions";
import { initialAuthActionState } from "../action-state";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your School Dashboard account.",
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Log In",
  url: `${SITE_URL}/login`,
  isPartOf: {
    "@type": "WebSite",
    name: "School Dashboard",
    url: SITE_URL,
  },
};

export default function LoginPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AuthPageTemplate
        title="Welcome back"
        subtitle="Log in to manage your school dashboard."
        footerSlot={
          <>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-brand-600 hover:underline">
              Create one
            </Link>
          </>
        }
      >
        <LoginForm action={loginAction} initialState={initialAuthActionState} />
      </AuthPageTemplate>
    </>
  );
}
