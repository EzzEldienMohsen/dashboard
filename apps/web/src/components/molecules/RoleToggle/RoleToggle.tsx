import { cn } from "@/lib/cn";
import type { Role } from "@/lib/validation/auth.schema";

export interface RoleToggleProps {
  name?: string;
  defaultValue?: Role;
  invalid?: boolean;
  "aria-describedby"?: string;
}

const OPTIONS: { value: Role; label: string }[] = [
  { value: "MANAGER", label: "Manager" },
  { value: "TEACHER", label: "Teacher" },
];

/**
 * Register-specific role enum, presented as a segmented control. Pure
 * native radios + peer-checked styling — no client JS required.
 */
export function RoleToggle({
  name = "role",
  defaultValue,
  invalid,
  ...rest
}: RoleToggleProps) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "grid grid-cols-2 gap-2 rounded-field border bg-neutral-50 p-1",
        invalid ? "border-danger-500" : "border-neutral-200",
      )}
      {...rest}
    >
      {OPTIONS.map((option) => (
        <label key={option.value} className="relative">
          <input
            type="radio"
            name={name}
            value={option.value}
            defaultChecked={defaultValue === option.value}
            className="peer sr-only"
            required
          />
          <span className="flex cursor-pointer items-center justify-center rounded-[calc(var(--radius-field)-0.25rem)] py-2 text-body text-neutral-600 transition-colors peer-checked:bg-brand-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400/60">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}
