import worldCountries from "world-countries";

export interface CountryOption {
  code: string;
  label: string;
}

/**
 * Server-only adapter. The full `world-countries` dataset never reaches
 * client JS — only the small {code,label}[] array this returns does.
 */
export function getCountryOptions(): CountryOption[] {
  return worldCountries
    .map((country) => ({ code: country.cca2, label: country.name.common }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
