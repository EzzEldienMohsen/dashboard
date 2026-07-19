import { redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getClasses } from "@/lib/data";
import { CLASS_TABS_FETCH_LIMIT } from "./constants";

/**
 * The tab bar lives in the shared layout; this index route just forwards
 * to the first class's detail page so `/dashboard/classes` always lands on
 * real content instead of an empty shell.
 */
export default async function DashboardClassesIndexPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) {
    redirect({ href: "/login", locale });
    return null;
  }

  const classesPage = await getClasses(
    user.accessToken,
    1,
    CLASS_TABS_FETCH_LIMIT,
  );
  const firstClass = classesPage?.items[0];

  if (firstClass) {
    redirect({ href: `/dashboard/classes/${firstClass.id}`, locale });
    return null;
  }

  const t = await getTranslations("classes");
  return <p className="text-base-content/60">{t("empty")}</p>;
}
