import { getTranslations } from "next-intl/server";
import type { SchoolDto } from "@/lib/data";

export interface SchoolCardProps {
  school: SchoolDto;
}

export async function SchoolCard({ school }: SchoolCardProps) {
  const t = await getTranslations("schools");

  return (
    <section className="rounded-2xl border border-base-300 bg-base-100 p-6">
      <h2 className="text-lg font-semibold text-base-content">{school.name}</h2>
      <dl className="mt-3">
        <dt className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
          {t("address")}
        </dt>
        <dd className="text-base-content">{school.address ?? t("noAddress")}</dd>
      </dl>
    </section>
  );
}
