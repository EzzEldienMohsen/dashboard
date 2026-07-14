import { LanguageSwitcher } from "@/components/molecules/LanguageSwitcher";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";

/**
 * Fully server-renderable shell — no 'use client'. Interactivity lives only
 * inside the atoms/molecules it composes, matching AuthPageTemplate's split.
 * Temporary placement until a real dashboard shell/nav exists.
 */
export function AppTopBar() {
  return (
    <div className="flex items-center justify-end gap-3 border-b border-base-300 px-4 py-2">
      <LanguageSwitcher />
      <ThemeToggle />
    </div>
  );
}
