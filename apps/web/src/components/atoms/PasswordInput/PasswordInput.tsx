"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import {
  fieldInputBaseClassName,
  type BaseFieldInputProps,
} from "../field-input";
import { cn } from "@/lib/cn";

export type PasswordInputProps = BaseFieldInputProps;

export function PasswordInput({ invalid, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const toggleId = useId();
  const t = useTranslations("auth.passwordInput");

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={cn(
          fieldInputBaseClassName,
          "pe-11",
          invalid &&
            "border-error focus:border-error focus:ring-error/30",
          !invalid && "border-base-300",
        )}
        aria-invalid={invalid || undefined}
        {...rest}
      />
      <button
        type="button"
        id={toggleId}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("hideAriaLabel") : t("showAriaLabel")}
        aria-pressed={visible}
        className="absolute inset-y-0 end-0 flex items-center px-3 text-small text-base-content/70 hover:text-base-content"
      >
        {visible ? t("hide") : t("show")}
      </button>
    </div>
  );
}
