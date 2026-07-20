import { fieldInputBaseClassName } from "../field-input";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  id: string;
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  value?: string;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  "aria-describedby"?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}

export function Select({
  options,
  placeholder,
  invalid,
  ...rest
}: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          fieldInputBaseClassName,
          "appearance-none pe-9",
          invalid && "border-error focus:border-error focus:ring-error/30",
          !invalid && "border-base-300",
        )}
        aria-invalid={invalid || undefined}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled className="bg-base-100 text-base-content">
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-base-100 text-base-content"
          >
            {option.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-base-content/50"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.25 7.5 10 12.25l4.75-4.75"
        />
      </svg>
    </div>
  );
}
