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
        "text-small font-medium text-base-content",
        className,
      )}
      {...rest}
    >
      {children}
      {required ? (
        <span aria-hidden="true" className="ms-0.5 text-error">
          *
        </span>
      ) : null}
    </label>
  );
}
