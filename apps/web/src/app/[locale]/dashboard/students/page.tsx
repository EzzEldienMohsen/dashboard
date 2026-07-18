import type { Metadata } from "next";
import { redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Title } from "@/components/atoms/Title";
import { StudentsSection } from "@/components/organisms/StudentsSection";
import { getCurrentUser } from "@/lib/auth/session";
import { getClasses, getStudents } from "@/lib/data";
import { fetchStudentsAction } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("students");
  return { title: t("title"), robots: { index: false, follow: false } };
}

const EMPTY_STUDENTS_PAGE = { items: [], total: 0, page: 1, limit: 20 };
const CLASS_FILTER_OPTIONS_LIMIT = 100;

export default async function DashboardStudentsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/login", locale: await getLocale() });
    return;
  }

  const t = await getTranslations("students");

  const [initialData, classesPage] = await Promise.all([
    getStudents(user.accessToken, 1),
    getClasses(user.accessToken, 1, CLASS_FILTER_OPTIONS_LIMIT),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Title as="h1">{t("title")}</Title>
      <StudentsSection
        initialData={initialData ?? EMPTY_STUDENTS_PAGE}
        classOptions={classesPage?.items ?? []}
        fetchStudents={fetchStudentsAction}
      />
    </div>
  );
}
