import { getTranslations } from "next-intl/server";
import { HeroSectionMotion } from "./HeroSectionMotion";

interface HeroSectionProps {
  schoolName: string;
  mission: string;
}

export async function HeroSection({ schoolName, mission }: HeroSectionProps) {
  const t = await getTranslations("home.hero");

  return (
    <section className="py-20 md:py-32 text-center">
      <HeroSectionMotion
        schoolName={schoolName}
        mission={mission}
        ctaStart={t("ctaStart")}
        ctaLogin={t("ctaLogin")}
      />
    </section>
  );
}
