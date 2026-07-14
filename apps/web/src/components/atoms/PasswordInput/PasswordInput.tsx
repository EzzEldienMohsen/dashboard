"use client";

import { useId, useState } from "react";
import {
  fieldInputBaseClassName,
  type BaseFieldInputProps,
} from "../field-input";
import { cn } from "@/lib/cn";

export type PasswordInputProps = BaseFieldInputProps;

export function PasswordInput({ invalid, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const toggleId = useId();

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={cn(
          fieldInputBaseClassName,
          "pr-11",
          invalid &&
            "border-danger-500 focus:border-danger-500 focus:ring-danger-500/30",
          !invalid && "border-neutral-200",
        )}
        aria-invalid={invalid || undefined}
        {...rest}
      />
      <button
        type="button"
        id={toggleId}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-small text-neutral-600 hover:text-neutral-900"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
