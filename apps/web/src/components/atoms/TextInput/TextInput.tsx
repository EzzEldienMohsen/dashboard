import type { InputHTMLAttributes } from "react";
import {
  fieldInputBaseClassName,
  type BaseFieldInputProps,
} from "../field-input";
import { cn } from "@/lib/cn";

export interface TextInputProps
  extends BaseFieldInputProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, "type" | "maxLength"> {}

export function TextInput({
  invalid,
  className,
  type = "text",
  ...rest
}: TextInputProps & { className?: string }) {
  return (
    <input
      type={type}
      className={cn(
        fieldInputBaseClassName,
        invalid && "border-danger-500 focus:border-danger-500 focus:ring-danger-500/30",
        !invalid && "border-neutral-200",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}
