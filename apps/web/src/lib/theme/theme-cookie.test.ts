import { describe, expect, it } from "vitest";
import {
  isTheme,
  oppositeTheme,
  resolveTheme,
  THEME_COOKIE,
  THEME_COOKIE_MAX_AGE_SECONDS,
} from "./theme-cookie";

describe("theme-cookie constants", () => {
  it("exposes the theme cookie name", () => {
    expect(THEME_COOKIE).toBe("theme");
  });

  it("exposes a one-year max-age", () => {
    expect(THEME_COOKIE_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 365);
  });
});

describe("isTheme", () => {
  it("returns true for schoollight", () => {
    expect(isTheme("schoollight")).toBe(true);
  });

  it("returns true for schooldark", () => {
    expect(isTheme("schooldark")).toBe(true);
  });

  it("returns false for an unrecognized string", () => {
    expect(isTheme("dracula")).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isTheme(undefined)).toBe(false);
  });

  it("returns false for null", () => {
    expect(isTheme(null)).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isTheme("")).toBe(false);
  });
});

describe("resolveTheme", () => {
  it("returns the theme when the cookie value is valid", () => {
    expect(resolveTheme("schoollight")).toBe("schoollight");
    expect(resolveTheme("schooldark")).toBe("schooldark");
  });

  it("returns undefined when the cookie value is invalid", () => {
    expect(resolveTheme("bogus")).toBeUndefined();
  });

  it("returns undefined when the cookie value is undefined", () => {
    expect(resolveTheme(undefined)).toBeUndefined();
  });
});

describe("oppositeTheme", () => {
  it("flips schoollight to schooldark", () => {
    expect(oppositeTheme("schoollight")).toBe("schooldark");
  });

  it("flips schooldark to schoollight", () => {
    expect(oppositeTheme("schooldark")).toBe("schoollight");
  });
});
