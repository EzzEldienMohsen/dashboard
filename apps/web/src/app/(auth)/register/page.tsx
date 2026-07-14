import type { Metadata } from "next";
import Link from "next/link";
import { AuthPageTemplate } from "@/components/templates/AuthPageTemplate";
import { RegisterForm } from "@/components/organisms/RegisterForm";
import { registerAction } from "../actions";
import { initialAuthActionState } from "../action-state";
import { getCountryOptions } from "@/lib/countries";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Create a School Dashboard account as a manager or teacher.",
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Create an Account",
  url: `${SITE_URL}/register`,
  isPartOf: {
    "@type": "WebSite",
    name: "School Dashboard",
    url: SITE_URL,
  },
};

export default function RegisterPage() {
  const countryOptions = getCountryOptions();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AuthPageTemplate
        title="Create your account"
        subtitle="Set up access as a manager or teacher."
        footerSlot={
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-600 hover:underline">
              Log in
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
