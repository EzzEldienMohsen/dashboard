"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { NavLink } from "@/components/molecules/NavLink";
import { NAV_LINKS } from "@/lib/config/nav-links";

export function DesktopNav() {
  const t = useTranslations("nav");

  return (
    <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
      {NAV_LINKS.map((link) => (
        <NavLink key={link.href} href={link.href}>
          {t(link.labelKey as Parameters<typeof t>[0])}
        </NavLink>
      ))}
      <Link href="/register" className="btn btn-primary btn-sm ms-2">
        {t("getStarted")}
      </Link>
    </nav>
  );
}
