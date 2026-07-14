import { Select } from "@/components/atoms/Select";
import type { CountryOption } from "@/lib/countries";

export interface CountrySelectProps {
  id?: string;
  name?: string;
  options: CountryOption[];
  placeholder: string;
  defaultValue?: string;
  invalid?: boolean;
  "aria-describedby"?: string;
}

/**
 * Depends only on the {code,label}[] shape — never imports the
 * world-countries package itself (dependency inversion). A native <select>
 * gives free keyboard type-ahead search with zero client JS. Placeholder
 * text comes from the caller rather than a useTranslations() call here, so
 * this stays a plain presentational module with no i18n dependency of its
 * own, consistent with FormField.
 */
export function CountrySelect({
  options,
  placeholder,
  id = "country",
  name = "country",
  ...rest
}: CountrySelectProps) {
  return (
    <Select
      id={id}
      name={name}
      placeholder={placeholder}
      options={options.map((option) => ({
        value: option.label,
        label: option.label,
      }))}
      {...rest}
    />
  );
}
