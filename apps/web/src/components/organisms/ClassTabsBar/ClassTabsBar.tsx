"use client";

import { Link, usePathname } from "@/i18n/navigation";
import * as Sentry from "@sentry/nextjs";
import type { ClassDto } from "@/lib/data";

export interface ClassTabsBarProps {
  classes: ClassDto[];
  ariaLabel: string;
}

/**
 * Tabs that route between classes — each "tab" is a real link to
 * `/dashboard/classes/[classId]`, so every class has its own bookmarkable,
 * fully server-rendered URL rather than a client-side panel toggle. Only
 * the active-tab highlighting needs a client boundary (usePathname).
 */
export function ClassTabsBar({ classes, ariaLabel }: ClassTabsBarProps) {
  const pathname = usePathname();

  if (classes.length === 0) return null;

  return (
    <div role="tablist" className="flex flex-wrap gap-2" aria-label={ariaLabel}>
      {classes.map((klass) => {
        const href = `/dashboard/classes/${klass.id}`;
        const isActive = pathname === href;
        return (
          <Link
            key={klass.id}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`btn btn-sm ${isActive ? "btn-primary" : "btn-ghost border border-base-300"}`}
            onClick={() => {
              Sentry.addBreadcrumb({
                category: "navigation",
                message: "classes-tab-switched",
                data: { classId: klass.id },
              });
            }}
          >
            {klass.name}
          </Link>
        );
      })}
    </div>
  );
}
