import { getTranslations } from "next-intl/server";

export async function HowItWorksSection() {
  const t = await getTranslations("features.howItWorks");

  const steps = Array.from({ length: 3 }, (_, i) => ({
    title: t(`steps.${i}.title` as Parameters<typeof t>[0]),
    desc: t(`steps.${i}.desc` as Parameters<typeof t>[0]),
    step: i + 1,
  }));

  return (
    <section className="py-16">
      <h2 className="text-2xl font-bold text-base-content mb-10">{t("heading")}</h2>
      <ol className="flex flex-col md:flex-row gap-8">
        {steps.map(({ step, title, desc }) => (
          <li key={step} className="flex-1 flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content font-bold text-sm">
              {step}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-base-content">{title}</h3>
              <p className="text-sm text-base-content/60 leading-relaxed">{desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
