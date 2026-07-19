import { getTranslations } from "next-intl/server";
import { NavLink } from "@/components/molecules/NavLink";
import { DASHBOARD_NAV_LINKS } from "@/lib/config/dashboard-nav-links";
import type { Role } from "@/lib/auth/session";

export interface SidebarNavProps {
  role: Role;
}

/**
 * Server-renderable — filtering by role happens here, not in NavLink
 * (which stays a generic, domain-unaware active-link atom).
 */
export async function SidebarNav({ role }: SidebarNavProps) {
  const t = await getTranslations("dashboard.nav");
  const links = DASHBOARD_NAV_LINKS.filter((link) => link.roles.includes(role));

  return (
    <nav
      aria-label={t("sidebarLabel")}
      className="hidden w-56 shrink-0 flex-col gap-1 border-e border-base-300 bg-base-100 p-4 md:flex"
    >
      {links.map((link) => (
        <NavLink key={link.href} href={link.href}>
          {t(link.labelKey)}
        </NavLink>
      ))}
    </nav>
  );
}
