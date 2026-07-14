import { Select } from "@/components/atoms/Select";
import type { CountryOption } from "@/lib/countries";

export interface CountrySelectProps {
  id?: string;
  name?: string;
  options: CountryOption[];
  defaultValue?: string;
  invalid?: boolean;
  "aria-describedby"?: string;
}

/**
 * Depends only on the {code,label}[] shape — never imports the
 * world-countries package itself (dependency inversion). A native <select>
 * gives free keyboard type-ahead search with zero client JS.
 */
export function CountrySelect({ options, id = "country", name = "country", ...rest }: CountrySelectProps) {
  return (
    <Select
      id={id}
      name={name}
      placeholder="Select a country"
      options={options.map((option) => ({
        value: option.label,
        label: option.label,
      }))}
      {...rest}
    />
  );
}
