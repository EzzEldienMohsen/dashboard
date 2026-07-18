import type { Role } from "@/lib/auth/session";

export interface DashboardNavLinkConfig {
  href: string;
  labelKey: string;
  roles: Role[];
}

export const DASHBOARD_NAV_LINKS: DashboardNavLinkConfig[] = [
  { href: "/dashboard", labelKey: "overview", roles: ["MANAGER"] },
  { href: "/dashboard/classes", labelKey: "classes", roles: ["MANAGER", "TEACHER"] },
  { href: "/dashboard/students", labelKey: "students", roles: ["MANAGER", "TEACHER"] },
];
