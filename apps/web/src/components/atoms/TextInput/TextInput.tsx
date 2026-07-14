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
        invalid && "border-error focus:border-error focus:ring-error/30",
        !invalid && "border-base-300",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}
