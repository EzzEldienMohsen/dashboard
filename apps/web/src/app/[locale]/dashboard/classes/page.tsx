import type { Metadata } from "next";
import { redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Title } from "@/components/atoms/Title";
import { ClassesSection } from "@/components/organisms/ClassesSection";
import { getCurrentUser } from "@/lib/auth/session";
import { getClasses } from "@/lib/data";
import { fetchClassesAction } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("classes");
  return { title: t("title"), robots: { index: false, follow: false } };
}

const EMPTY_PAGE = { items: [], total: 0, page: 1, limit: 20 };

export default async function DashboardClassesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/login", locale: await getLocale() });
    return;
  }

  const t = await getTranslations("classes");
  const initialData = (await getClasses(user.accessToken, 1)) ?? EMPTY_PAGE;

  return (
    <div className="flex flex-col gap-6">
      <Title as="h1">{t("title")}</Title>
      <ClassesSection initialData={initialData} fetchClasses={fetchClassesAction} />
    </div>
  );
}
