import { getTranslations } from "next-intl/server";
import { getCreator } from "@/lib/api";
import { CreatorSectionMotion } from "./CreatorSectionMotion";

export async function CreatorSection() {
  const [t, creator] = await Promise.all([
    getTranslations("about.creator"),
    getCreator(),
  ]);

  if (!creator.name) return null;

  return (
    <section className="py-16">
      <CreatorSectionMotion
        creator={creator}
        labels={{
          heading: t("heading"),
          skillsHeading: t("skillsHeading"),
          github: t("github"),
          linkedin: t("linkedin"),
          portfolio: t("portfolio"),
          email: t("email"),
        }}
      />
    </section>
  );
}
