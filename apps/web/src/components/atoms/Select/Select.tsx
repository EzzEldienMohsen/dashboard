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
    <select
      className={cn(
        fieldInputBaseClassName,
        "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%2352525b%22><path fill-rule=%22evenodd%22 d=%22M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z%22 clip-rule=%22evenodd%22/></svg>')] bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9",
        invalid &&
          "border-danger-500 focus:border-danger-500 focus:ring-danger-500/30",
        !invalid && "border-neutral-200",
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
