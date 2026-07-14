import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SubtitleProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

export function Subtitle({
  as: Tag = "p",
  children,
  className,
}: SubtitleProps) {
  return (
    <Tag className={cn("text-subtitle text-neutral-600", className)}>
      {children}
    </Tag>
  );
}
