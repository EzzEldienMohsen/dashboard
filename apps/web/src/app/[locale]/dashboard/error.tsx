"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { useTranslations } from "next-intl";
import { Title } from "@/components/atoms/Title";
import { Subtitle } from "@/components/atoms/Subtitle";
import { Button } from "@/components/atoms/Button";

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const t = useTranslations("dashboard.error");

  useEffect(() => {
    Sentry.addBreadcrumb({
      category: "route",
      message: "dashboard-route-error-boundary-triggered",
      level: "error",
      data: { digest: error.digest },
    });
    Sentry.captureException(error, { extra: { digest: error.digest } });
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center px-[4%] py-12">
      <div
        className="flex w-full flex-col items-center gap-4 rounded-2xl border border-base-300 bg-base-100 p-[6%] text-center shadow-sm"
        style={{ maxWidth: "min(92%, 28rem)" }}
      >
        <Title as="h1">{t("title")}</Title>
        <Subtitle as="p">{t("message")}</Subtitle>
        <Button onClick={() => unstable_retry()} className="w-auto px-6">
          {t("retry")}
        </Button>
      </div>
    </div>
  );
}
