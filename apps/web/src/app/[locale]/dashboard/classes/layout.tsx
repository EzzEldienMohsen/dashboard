import type { Metadata } from "next";
import { redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Title } from "@/components/atoms/Title";
import { ClassTabsBar } from "@/components/organisms/ClassTabsBar";
import { getCurrentUser } from "@/lib/auth/session";
import { getClasses } from "@/lib/data";
import { CLASS_TABS_FETCH_LIMIT } from "./constants";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("classes");
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function DashboardClassesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) {
    redirect({ href: "/login", locale });
    return null;
  }

  const t = await getTranslations("classes");
  const classesPage = await getClasses(
    user.accessToken,
    1,
    CLASS_TABS_FETCH_LIMIT,
  );
  const classes = classesPage?.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <Title as="h1">{t("title")}</Title>
      <ClassTabsBar classes={classes} ariaLabel={t("title")} />
      {children}
    </div>
  );
}
