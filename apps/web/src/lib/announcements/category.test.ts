import { describe, expect, it } from "vitest";
import { CATEGORY_BADGE_CLASS, getCategoryBadgeClass } from "./category";

describe("CATEGORY_BADGE_CLASS", () => {
  it("maps every known category to its badge class", () => {
    expect(CATEGORY_BADGE_CLASS).toEqual({
      GENERAL: "badge-neutral",
      EVENT: "badge-info",
      EXAM: "badge-warning",
      HOLIDAY: "badge-success",
      URGENT: "badge-error",
    });
  });
});

describe("getCategoryBadgeClass", () => {
  it.each([
    ["GENERAL", "badge-neutral"],
    ["EVENT", "badge-info"],
    ["EXAM", "badge-warning"],
    ["HOLIDAY", "badge-success"],
    ["URGENT", "badge-error"],
  ])("returns %s's class as %s", (category, expected) => {
    expect(getCategoryBadgeClass(category)).toBe(expected);
  });

  it("falls back to badge-neutral for an unknown category", () => {
    expect(getCategoryBadgeClass("SOMETHING_UNKNOWN")).toBe("badge-neutral");
  });

  it("falls back to badge-neutral for an empty string", () => {
    expect(getCategoryBadgeClass("")).toBe("badge-neutral");
  });
});
