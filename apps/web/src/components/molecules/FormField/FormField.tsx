import { cloneElement, isValidElement, type ReactElement } from "react";
import { Label } from "@/components/atoms/Label";
import { ErrorText } from "@/components/atoms/ErrorText";
import { cn } from "@/lib/cn";

export interface FormFieldProps {
  name: string;
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactElement;
}

/**
 * Layout + a11y wiring only — no knowledge of validation rules or field
 * types. New field types are added by composing an input atom inside this,
 * never by modifying it (open/closed).
 */
export function FormField({
  name,
  label,
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  const inputId = name;
  const errorId = error ? `${name}-error` : undefined;

  const input = isValidElement<{
    id?: string;
    name?: string;
    "aria-describedby"?: string;
    invalid?: boolean;
  }>(children)
    ? cloneElement(children, {
        id: inputId,
        name,
        "aria-describedby": errorId,
        invalid: Boolean(error),
      })
    : children;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={inputId} required={required}>
        {label}
      </Label>
      {input}
      <ErrorText id={errorId} message={error} />
    </div>
  );
}
