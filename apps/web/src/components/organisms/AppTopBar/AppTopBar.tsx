import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/molecules/LanguageSwitcher";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { Button } from "@/components/atoms/Button";
import type { Role } from "@/lib/auth/session";

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
  const t = await getTranslations("dashboard.nav");

  return (
    <div className="flex items-center justify-between gap-3 border-b border-base-300 px-4 py-2">
      <span className="text-small text-base-content/70">
        {userEmail} · {role}
      </span>
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
