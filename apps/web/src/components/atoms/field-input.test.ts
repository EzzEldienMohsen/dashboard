import { describe, expect, it } from "vitest";
import { fieldInputBaseClassName } from "./field-input";

describe("fieldInputBaseClassName", () => {
  it("is a non-empty class string with the shared field styling", () => {
    expect(typeof fieldInputBaseClassName).toBe("string");
    expect(fieldInputBaseClassName.length).toBeGreaterThan(0);
    expect(fieldInputBaseClassName).toContain("rounded-field");
    expect(fieldInputBaseClassName).toContain("disabled:opacity-60");
  });
});
