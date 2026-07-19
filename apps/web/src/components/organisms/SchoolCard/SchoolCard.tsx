import { getTranslations } from "next-intl/server";
import { Card } from "@/components/molecules/Card";
import type { SchoolDto } from "@/lib/data";

export interface SchoolCardProps {
  school: SchoolDto;
}

export async function SchoolCard({ school }: SchoolCardProps) {
  const t = await getTranslations("schools");

  return (
    <Card title={school.name}>
      <dl className="mt-3">
        <dt className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
          {t("address")}
        </dt>
        <dd className="text-base-content">{school.address ?? t("noAddress")}</dd>
      </dl>
    </Card>
  );
}
