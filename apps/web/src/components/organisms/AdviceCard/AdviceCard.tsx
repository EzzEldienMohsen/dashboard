"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/molecules/Card";
import type { AdviceItemDto } from "@/lib/data";

export interface AdviceCardProps {
  advice: AdviceItemDto[];
}

/**
 * Renders backend-localized advice sentences verbatim — the API resolves
 * `Accept-Language` and returns each `message` already translated (via
 * nestjs-i18n), so this component owns no copy or ICU templating itself.
 */
export function AdviceCard({ advice }: AdviceCardProps) {
  const t = useTranslations("analytics");

  return (
    <Card title={t("adviceTitle")}>
      {advice.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-3">
          {advice.map((item) => (
            <li
              key={`${item.subject}-${item.severity}`}
              className="flex items-start gap-3 rounded-xl border border-base-300 bg-base-200/40 p-3 text-sm text-base-content"
            >
              <span
                className={`badge badge-sm shrink-0 ${
                  item.severity === "strength" ? "badge-success" : "badge-warning"
                }`}
              >
                {item.subject}
              </span>
              <span>{item.message}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-base-content/60">{t("noAdvice")}</p>
      )}
    </Card>
  );
}
