import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TitleProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

export function Title({ as: Tag = "h1", children, className }: TitleProps) {
  return (
    <Tag
      className={cn(
        "text-title font-semibold text-neutral-900 tracking-title",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
