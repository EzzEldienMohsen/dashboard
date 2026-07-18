import { describe, expect, it } from "vitest";
import { getCountryOptions } from "./countries";

describe("getCountryOptions", () => {
  it("returns a non-empty array of {code, label} entries", () => {
    const options = getCountryOptions();
    expect(options.length).toBeGreaterThan(0);
    for (const option of options) {
      expect(typeof option.code).toBe("string");
      expect(typeof option.label).toBe("string");
      expect(option.code.length).toBeGreaterThan(0);
      expect(option.label.length).toBeGreaterThan(0);
    }
  });

  it("sorts entries by label using locale-aware comparison", () => {
    const options = getCountryOptions();
    const labels = options.map((o) => o.label);
    const sorted = [...labels].sort((a, b) => a.localeCompare(b));
    expect(labels).toEqual(sorted);
  });

  it("includes well-known countries with their ISO alpha-2 codes", () => {
    const options = getCountryOptions();
    expect(options).toContainEqual({ code: "EG", label: "Egypt" });
    expect(options).toContainEqual({ code: "US", label: "United States" });
  });

  it("returns one entry per country code (no duplicates)", () => {
    const options = getCountryOptions();
    const codes = options.map((o) => o.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
