import { describe, expect, it } from "vitest";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "./session-cookie";

describe("session-cookie constants", () => {
  it("exposes the session cookie name", () => {
    expect(SESSION_COOKIE).toBe("session");
  });

  it("exposes a max-age matching the 1h default JWT expiry", () => {
    expect(SESSION_MAX_AGE_SECONDS).toBe(60 * 60);
  });
});
