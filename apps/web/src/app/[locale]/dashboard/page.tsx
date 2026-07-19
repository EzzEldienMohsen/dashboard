import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Title } from "@/components/atoms/Title";
import { SchoolCard } from "@/components/organisms/SchoolCard";
import { SchoolAnalyticsSection } from "@/components/organisms/SchoolAnalyticsSection";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getMySchool,
  getSchoolAnalytics,
  getSchoolMonthlyAnalytics,
  getClassesSummary,
} from "@/lib/data";
import {
  fetchSchoolAnalyticsAction,
  fetchSchoolMonthlyAnalyticsAction,
  fetchClassesSummaryAction,
} from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.overview");
  return { title: t("title"), robots: { index: false, follow: false } };
}

function AnalyticsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="skeleton h-64 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="skeleton h-64 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
      <div className="skeleton h-32 rounded-2xl" />
      <div className="skeleton h-48 rounded-2xl" />
    </>
  );
}

async function SchoolAnalyticsData({
  accessToken,
  schoolId,
}: {
  accessToken: string;
  schoolId: string;
}) {
  const [analytics, monthly, classesSummary] = await Promise.all([
    getSchoolAnalytics(accessToken, schoolId),
    getSchoolMonthlyAnalytics(accessToken, schoolId),
    getClassesSummary(accessToken, schoolId),
  ]);

  if (!analytics) return null;

  return (
    <SchoolAnalyticsSection
      initialAnalytics={analytics}
      initialMonthly={monthly ?? []}
      initialClassesSummary={classesSummary ?? []}
      fetchAnalytics={fetchSchoolAnalyticsAction}
      fetchMonthly={fetchSchoolMonthlyAnalyticsAction}
      fetchClassesSummary={fetchClassesSummaryAction}
    />
  );
}

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) {
    redirect({ href: "/login", locale });
    return;
  }
  // /dashboard is MANAGER-only — GET /schools resolves to a single school,
  // so there's nothing here for a Teacher (they land on /dashboard/classes).
  if (user.role !== "MANAGER") {
    redirect({ href: "/dashboard/classes", locale });
    return;
  }

  const t = await getTranslations("dashboard.overview");
  const school = await getMySchool(user.accessToken, user.schoolId);

  return (
    <div className="flex flex-col gap-6">
      <Title as="h1">{t("title")}</Title>
      {school ? <SchoolCard school={school} /> : null}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <SchoolAnalyticsData
          accessToken={user.accessToken}
          schoolId={user.schoolId}
        />
      </Suspense>
    </div>
  );
}
