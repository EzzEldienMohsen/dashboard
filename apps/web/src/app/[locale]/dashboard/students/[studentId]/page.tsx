import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { redirect, Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Title } from "@/components/atoms/Title";
import { StudentAnalyticsSection } from "@/components/organisms/StudentAnalyticsSection";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getClassById,
  getStudentById,
  getStudentAnalytics,
  getStudentMonthlyAnalytics,
} from "@/lib/data";
import {
  fetchStudentAnalyticsAction,
  fetchStudentMonthlyAnalyticsAction,
} from "../actions";

interface StudentDetailPageProps {
  params: Promise<{ studentId: string }>;
}

export async function generateMetadata({
  params,
}: StudentDetailPageProps): Promise<Metadata> {
  const { studentId } = await params;
  const user = await getCurrentUser();
  if (!user) return { robots: { index: false, follow: false } };

  const student = await getStudentById(user.accessToken, studentId);
  return {
    title: student ? `${student.firstName} ${student.lastName}` : undefined,
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
      <div className="skeleton h-40 rounded-2xl" />
      <div className="skeleton h-48 rounded-2xl" />
    </>
  );
}

async function StudentAnalyticsData({
  accessToken,
  studentId,
  locale,
  attendanceTitle,
}: {
  accessToken: string;
  studentId: string;
  locale: string;
  attendanceTitle: string;
}) {
  const [analytics, monthly] = await Promise.all([
    getStudentAnalytics(accessToken, studentId, locale),
    getStudentMonthlyAnalytics(accessToken, studentId),
  ]);

  if (!analytics) return null;

  return (
    <StudentAnalyticsSection
      studentId={studentId}
      locale={locale}
      attendanceTitle={attendanceTitle}
      initialAnalytics={analytics}
      initialMonthly={monthly ?? []}
      fetchAnalytics={fetchStudentAnalyticsAction}
      fetchMonthly={fetchStudentMonthlyAnalyticsAction}
    />
  );
}

export default async function DashboardStudentDetailPage({
  params,
}: StudentDetailPageProps) {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) {
    redirect({ href: "/login", locale });
    return null;
  }

  const { studentId } = await params;
  const t = await getTranslations("analytics");
  const tStudents = await getTranslations("students");

  const student = await getStudentById(user.accessToken, studentId);

  if (!student) {
    notFound();
  }

  const klass = await getClassById(user.accessToken, student.classId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Title as="h2">
          {student.firstName} {student.lastName}
        </Title>
        {klass ? (
          <p className="text-sm text-base-content/60">{klass.name}</p>
        ) : null}
      </div>
      <Suspense fallback={<AnalyticsSkeleton />}>
        <StudentAnalyticsData
          accessToken={user.accessToken}
          studentId={studentId}
          locale={locale}
          attendanceTitle={t("commitmentTitle")}
        />
      </Suspense>
      <Link
        href="/dashboard/students"
        className="link link-primary text-sm font-medium"
      >
        {tStudents("backToList")}
      </Link>
    </div>
  );
}
