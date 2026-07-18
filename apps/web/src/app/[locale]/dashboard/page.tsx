import type { Metadata } from "next";
import { redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Title } from "@/components/atoms/Title";
import { SchoolCard } from "@/components/organisms/SchoolCard";
import { AttendanceBreakdownCard } from "@/components/organisms/AttendanceBreakdownCard";
import { GradesBySubjectCard } from "@/components/organisms/GradesBySubjectCard";
import { getCurrentUser } from "@/lib/auth/session";
import { getMySchool, getSchoolAnalytics } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.overview");
  return { title: t("title"), robots: { index: false, follow: false } };
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

  const [school, analytics] = await Promise.all([
    getMySchool(user.accessToken, user.schoolId),
    getSchoolAnalytics(user.accessToken, user.schoolId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Title as="h1">{t("title")}</Title>
      {school ? <SchoolCard school={school} /> : null}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {analytics ? (
          <>
            <AttendanceBreakdownCard
              breakdown={analytics.attendanceBreakdown}
              attendanceRatePercentage={analytics.attendanceRatePercentage}
            />
            <GradesBySubjectCard
              gradesBySubject={analytics.gradesBySubject}
              averageGradePercentage={analytics.averageGradePercentage}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
