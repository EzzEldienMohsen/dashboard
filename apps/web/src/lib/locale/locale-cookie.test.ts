import { describe, expect, it } from "vitest";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE_SECONDS } from "./locale-cookie";

describe("locale-cookie constants", () => {
  it("names the cookie 'locale'", () => {
    expect(LOCALE_COOKIE).toBe("locale");
  });

  it("sets the max age to one year in seconds", () => {
    expect(LOCALE_COOKIE_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 365);
  });
});
