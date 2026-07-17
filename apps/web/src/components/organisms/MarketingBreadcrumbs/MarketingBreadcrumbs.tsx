"use client";

import { useEffect, useRef } from "react";
import * as Sentry from "@sentry/nextjs";

interface Crumb {
  label: string;
  href?: string;
}

interface MarketingBreadcrumbsProps {
  crumbs: Crumb[];
  sectionId?: string;
}

export function MarketingBreadcrumbs({ crumbs, sectionId }: MarketingBreadcrumbsProps) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;
    Sentry.addBreadcrumb({
      category: "navigation",
      message: crumbs.map((c) => c.label).join(" > "),
      level: "info",
    });
  }, [crumbs]);

  useEffect(() => {
    if (!sectionId) return;
    const el = document.getElementById(sectionId);
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          Sentry.addBreadcrumb({
            category: "ui.view",
            message: `Section viewed: ${sectionId}`,
            level: "info",
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionId]);

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-base-content/50 mb-6">
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((crumb, i) => (
          <li key={crumb.label} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {crumb.href ? (
              <a
                href={crumb.href}
                className="hover:text-base-content transition-colors"
                onClick={() => {
                  Sentry.addBreadcrumb({
                    category: "ui.click",
                    message: `Breadcrumb clicked: ${crumb.label}`,
                    level: "info",
                  });
                }}
              >
                {crumb.label}
              </a>
            ) : (
              <span className="text-base-content/80 font-medium">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
