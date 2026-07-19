import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CardProps {
  /** Omit entirely for cards that manage their own internal headings (e.g. two side-by-side sub-sections). */
  title?: ReactNode;
  /** Heading element for `title` — defaults to h2; override per page to keep one sensible heading hierarchy. */
  titleAs?: ElementType;
  /** Rendered next to the title, e.g. a headline percentage. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * The one card shell used across the dashboard (attendance, grades, advice,
 * school info, etc.) — extracted after the same
 * `rounded-2xl border border-base-300 bg-base-100 p-6` + title markup had
 * been hand-copied into 8 separate organisms.
 */
export function Card({
  title,
  titleAs: TitleTag = "h2",
  action,
  children,
  className,
}: CardProps) {
  const heading = (
    <TitleTag className="text-lg font-semibold text-base-content">
      {title}
    </TitleTag>
  );

  return (
    <section className={cn("rounded-2xl border border-base-300 bg-base-100 p-6", className)}>
      {title ? (
        action ? (
          <div className="flex items-baseline justify-between">
            {heading}
            {action}
          </div>
        ) : (
          heading
        )
      ) : null}
      {children}
    </section>
  );
}
