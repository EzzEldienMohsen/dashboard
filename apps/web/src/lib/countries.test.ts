import { describe, expect, it } from "vitest";
import { getCountryOptions } from "./countries";

describe("getCountryOptions", () => {
  it("returns a non-empty array of {code, value, label} entries", () => {
    const options = getCountryOptions("en");
    expect(options.length).toBeGreaterThan(0);
    for (const option of options) {
      expect(typeof option.code).toBe("string");
      expect(typeof option.value).toBe("string");
      expect(typeof option.label).toBe("string");
      expect(option.code.length).toBeGreaterThan(0);
      expect(option.value.length).toBeGreaterThan(0);
      expect(option.label.length).toBeGreaterThan(0);
    }
  });

  it("sorts entries by label using locale-aware comparison", () => {
    const options = getCountryOptions("en");
    const labels = options.map((o) => o.label);
    const sorted = [...labels].sort((a, b) => a.localeCompare(b, "en"));
    expect(labels).toEqual(sorted);
  });

  it("includes well-known countries with their ISO alpha-2 codes", () => {
    const options = getCountryOptions("en");
    expect(options).toContainEqual({ code: "EG", value: "Egypt", label: "Egypt" });
    expect(options).toContainEqual({ code: "US", value: "United States", label: "United States" });
  });

  it("returns one entry per country code (no duplicates)", () => {
    const options = getCountryOptions("en");
    const codes = options.map((o) => o.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("shows Arabic display names for the ar locale while keeping the English value stable", () => {
    const enOptions = getCountryOptions("en");
    const arOptions = getCountryOptions("ar");

    const egyptEn = enOptions.find((o) => o.code === "EG");
    const egyptAr = arOptions.find((o) => o.code === "EG");

    expect(egyptEn?.label).toBe("Egypt");
    expect(egyptAr?.label).toBe("مصر");
    // The submitted/stored value stays the stable English name regardless of display locale.
    expect(egyptAr?.value).toBe("Egypt");
  });
});
