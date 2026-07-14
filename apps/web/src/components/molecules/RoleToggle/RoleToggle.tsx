"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import type { Role } from "@/lib/validation/auth.schema";

export interface RoleToggleProps {
  name?: string;
  defaultValue?: Role;
  invalid?: boolean;
  "aria-describedby"?: string;
}

/**
 * Register-specific role enum, presented as a segmented control. Pure
 * native radios + peer-checked styling — "use client" is only needed here
 * to read the active locale's labels via useTranslations().
 */
export function RoleToggle({
  name = "role",
  defaultValue,
  invalid,
  ...rest
}: RoleToggleProps) {
  const t = useTranslations("auth.register");
  const options: { value: Role; label: string }[] = [
    { value: "MANAGER", label: t("roleManager") },
    { value: "TEACHER", label: t("roleTeacher") },
  ];

  return (
    <div
      role="radiogroup"
      className={cn(
        "grid grid-cols-2 gap-2 rounded-field border bg-base-100 p-1",
        invalid ? "border-error" : "border-base-300",
      )}
      {...rest}
    >
      {options.map((option) => (
        <label key={option.value} className="relative">
          <input
            type="radio"
            name={name}
            value={option.value}
            defaultChecked={defaultValue === option.value}
            className="peer sr-only"
            required
          />
          <span className="flex cursor-pointer items-center justify-center rounded-[calc(var(--radius-field)-0.25rem)] py-2 text-body text-base-content/70 transition-colors peer-checked:bg-primary peer-checked:text-primary-content peer-focus-visible:ring-2 peer-focus-visible:ring-primary/60">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}
