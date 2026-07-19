import { getTranslations } from "next-intl/server";
import type { SchoolProfile } from "@/lib/api/types";
import { SchoolProfileSectionMotion } from "./SchoolProfileSectionMotion";

interface SchoolProfileSectionProps {
  profile: SchoolProfile;
}

export async function SchoolProfileSection({ profile }: SchoolProfileSectionProps) {
  const t = await getTranslations("about.profile");

  return (
    <section className="py-16">
      <SchoolProfileSectionMotion
        profile={profile}
        labels={{
          mission: t("mission"),
          founded: t("founded"),
          address: t("address"),
          email: t("email"),
          phone: t("phone"),
        }}
      />
    </section>
  );
}
