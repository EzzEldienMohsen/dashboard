import Link from "next/link";
import { LogoMark } from "@/components/atoms/LogoMark";
import { LanguageSwitcher } from "@/components/molecules/LanguageSwitcher";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { SiteHeaderScrollWrapper } from "./SiteHeaderScrollWrapper";
import { SiteHeaderNav } from "./SiteHeaderNav";

export function SiteHeader({ schoolName }: { schoolName: string }) {
  return (
    <SiteHeaderScrollWrapper>
      <div className="mx-auto flex h-14 w-[90%] max-w-7xl items-center gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 font-semibold text-sm text-base-content"
          aria-label={`${schoolName} home`}
        >
          <LogoMark />
          <span className="hidden sm:inline">{schoolName}</span>
        </Link>

        <div className="flex-1" />

        {/* Nav + controls — responsive handled inside SiteHeaderNav */}
        <SiteHeaderNav />

        {/* Language + theme always visible */}
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </SiteHeaderScrollWrapper>
  );
}
