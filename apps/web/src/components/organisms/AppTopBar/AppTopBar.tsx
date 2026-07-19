import { getTranslations } from "next-intl/server";
import { NavLink } from "@/components/molecules/NavLink";
import { LanguageSwitcher } from "@/components/molecules/LanguageSwitcher";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { Button } from "@/components/atoms/Button";
import { NAV_LINKS } from "@/lib/config/nav-links";
import type { Role } from "@/lib/auth/session";
import { AppTopBarMobileNav } from "./AppTopBarMobileNav";

export interface AppTopBarProps {
  userEmail: string;
  role: Role;
  /** Injected Server Action — keeps this organism swappable/testable in isolation. */
  logoutAction: () => Promise<void>;
}

/**
 * Fully server-renderable shell — no 'use client'. Interactivity lives only
 * inside the atoms/molecules it composes, matching AuthPageTemplate's split.
 */
export async function AppTopBar({ userEmail, role, logoutAction }: AppTopBarProps) {
  const [t, tNav] = await Promise.all([
    getTranslations("dashboard.nav"),
    getTranslations("nav"),
  ]);
  const roleLabel = role === "MANAGER" ? t("roleManager") : t("roleTeacher");

  return (
    <div className="flex items-center justify-between gap-3 border-b border-base-300 px-4 py-2">
      <span className="text-small text-base-content/70">
        {userEmail} · {roleLabel}
      </span>
      <nav aria-label={t("publicNavLabel")} className="hidden md:flex items-center gap-4">
        {NAV_LINKS.map((link) => (
          <NavLink key={link.href} href={link.href}>
            {tNav(link.labelKey)}
          </NavLink>
        ))}
      </nav>
      <AppTopBarMobileNav role={role} />
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" className="w-auto">
            {t("logout")}
          </Button>
        </form>
      </div>
    </div>
  );
}
