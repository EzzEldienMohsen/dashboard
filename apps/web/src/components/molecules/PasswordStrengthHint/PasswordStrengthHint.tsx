"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

export interface PasswordStrengthHintProps {
  password: string;
}

interface Rule {
  key: string;
  label: string;
  test: (password: string) => boolean;
}

/**
 * Pure presentational component — mirrors the backend's password complexity
 * rules with no async/network involved. State lives in the caller. "use
 * client" is only needed here to read the active locale's labels.
 */
export function PasswordStrengthHint({ password }: PasswordStrengthHintProps) {
  const t = useTranslations("auth.passwordStrength");
  const rules: Rule[] = [
    { key: "length", label: t("length"), test: (p) => p.length >= 8 },
    { key: "upper", label: t("upper"), test: (p) => /[A-Z]/.test(p) },
    { key: "lower", label: t("lower"), test: (p) => /[a-z]/.test(p) },
    { key: "digit", label: t("digit"), test: (p) => /\d/.test(p) },
  ];

  return (
    <ul className="flex flex-col gap-1 text-small text-base-content/70">
      {rules.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.key}
            className={cn("flex items-center gap-1.5", met && "text-success")}
          >
            <span aria-hidden="true">{met ? "✓" : "○"}</span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
