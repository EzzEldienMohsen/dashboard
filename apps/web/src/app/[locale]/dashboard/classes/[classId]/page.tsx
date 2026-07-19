import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { Title } from "@/components/atoms/Title";
import { ClassAnalyticsSection } from "@/components/organisms/ClassAnalyticsSection";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getClassById,
  getClassAnalytics,
  getClassMonthlyAnalytics,
} from "@/lib/data";
import {
  fetchClassAnalyticsAction,
  fetchClassMonthlyAnalyticsAction,
} from "../actions";

interface ClassDetailPageProps {
  params: Promise<{ classId: string }>;
}

export async function generateMetadata({
  params,
}: ClassDetailPageProps): Promise<Metadata> {
  const { classId } = await params;
  const user = await getCurrentUser();
  if (!user) return { robots: { index: false, follow: false } };

  const klass = await getClassById(user.accessToken, classId);
  return {
    title: klass?.name,
    robots: { index: false, follow: false },
  };
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
    </>
  );
}

async function ClassAnalyticsData({
  accessToken,
  classId,
}: {
  accessToken: string;
  classId: string;
}) {
  const [analytics, monthly] = await Promise.all([
    getClassAnalytics(accessToken, classId),
    getClassMonthlyAnalytics(accessToken, classId),
  ]);

  if (!analytics) return null;

  return (
    <ClassAnalyticsSection
      classId={classId}
      initialAnalytics={analytics}
      initialMonthly={monthly ?? []}
      fetchAnalytics={fetchClassAnalyticsAction}
      fetchMonthly={fetchClassMonthlyAnalyticsAction}
    />
  );
}

export default async function DashboardClassDetailPage({
  params,
}: ClassDetailPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/login", locale: await getLocale() });
    return null;
  }

  const { classId } = await params;
  const klass = await getClassById(user.accessToken, classId);

  if (!klass) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Title as="h2">{klass.name}</Title>
      <Suspense fallback={<AnalyticsSkeleton />}>
        <ClassAnalyticsData accessToken={user.accessToken} classId={classId} />
      </Suspense>
    </div>
  );
}
