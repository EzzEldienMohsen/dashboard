import { cn } from "@/lib/cn";

export interface PasswordStrengthHintProps {
  password: string;
}

interface Rule {
  key: string;
  label: string;
  test: (password: string) => boolean;
}

const RULES: Rule[] = [
  { key: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { key: "upper", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { key: "lower", label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { key: "digit", label: "One number", test: (p) => /\d/.test(p) },
];

/**
 * Pure presentational component — mirrors the backend's password complexity
 * rules with no async/network involved. State lives in the caller.
 */
export function PasswordStrengthHint({ password }: PasswordStrengthHintProps) {
  return (
    <ul className="flex flex-col gap-1 text-small text-neutral-600">
      {RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.key}
            className={cn("flex items-center gap-1.5", met && "text-success-500")}
          >
            <span aria-hidden="true">{met ? "✓" : "○"}</span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
