import worldCountries from "world-countries";
import type { Locale } from "./locale/locales";

export interface CountryOption {
  code: string;
  /** Stable English common name — the value actually submitted/stored, regardless of display locale. */
  value: string;
  /** Locale-appropriate display name. */
  label: string;
}

/**
 * Server-only adapter. The full `world-countries` dataset never reaches
 * client JS — only the small {code,value,label}[] array this returns does.
 */
export function getCountryOptions(locale: Locale): CountryOption[] {
  return worldCountries
    .map((country) => ({
      code: country.cca2,
      value: country.name.common,
      label: locale === "ar" ? (country.translations.ara?.common ?? country.name.common) : country.name.common,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
}
