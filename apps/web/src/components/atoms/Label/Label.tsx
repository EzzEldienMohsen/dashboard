import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({
  required,
  children,
  className,
  ...rest
}: LabelProps) {
  return (
    <label
      className={cn(
        "text-small font-medium text-neutral-800",
        className,
      )}
      {...rest}
    >
      {children}
      {required ? (
        <span aria-hidden="true" className="ml-0.5 text-danger-500">
          *
        </span>
      ) : null}
    </label>
  );
}
