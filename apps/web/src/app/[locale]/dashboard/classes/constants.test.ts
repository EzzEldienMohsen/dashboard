import { describe, expect, it } from "vitest";
import { CLASS_TABS_FETCH_LIMIT } from "./constants";

describe("CLASS_TABS_FETCH_LIMIT", () => {
  it("is high enough to cover every class in a school without pagination", () => {
    expect(CLASS_TABS_FETCH_LIMIT).toBeGreaterThanOrEqual(100);
  });
});
