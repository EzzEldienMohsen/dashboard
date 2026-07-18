import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

interface HeroSectionProps {
  schoolName: string;
  mission: string;
}

export async function HeroSection({ schoolName, mission }: HeroSectionProps) {
  const t = await getTranslations("home.hero");

  return (
    <section className="py-20 md:py-32 text-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-base-content leading-tight max-w-3xl">
          {schoolName}
        </h1>
        <p className="text-lg md:text-xl text-base-content/60 max-w-2xl leading-relaxed">
          {mission}
        </p>
        <div className="flex flex-wrap gap-4 justify-center mt-2">
          <Link href="/register" className="btn btn-primary btn-lg">
            {t("ctaStart")}
          </Link>
          <Link href="/login" className="btn btn-outline btn-lg">
            {t("ctaLogin")}
          </Link>
        </div>
      </div>
    </section>
  );
}
