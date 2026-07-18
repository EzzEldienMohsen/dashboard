import { beforeEach, describe, expect, it, vi } from "vitest";
import { SESSION_COOKIE } from "./session-cookie";

const cookiesGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ get: cookiesGet })),
}));

function makeToken(claims: Record<string, unknown>): string {
  const encode = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  return `${encode({ alg: "none" })}.${encode(claims)}.signature`;
}

const FUTURE_EXP = Math.floor(Date.now() / 1000) + 3600;
const PAST_EXP = Math.floor(Date.now() / 1000) - 3600;

// React's cache() memoizes per function instance with no request-scoped
// storage in a plain Vitest run, so each test needs a fresh module import
// to avoid the first test's resolved value leaking into the rest.
async function importGetCurrentUser() {
  vi.resetModules();
  const mod = await import("./session");
  return mod.getCurrentUser;
}

describe("getCurrentUser", () => {
  beforeEach(() => {
    cookiesGet.mockReset();
  });

  it("returns null when there is no session cookie", async () => {
    cookiesGet.mockReturnValue(undefined);
    const getCurrentUser = await importGetCurrentUser();

    await expect(getCurrentUser()).resolves.toBeNull();
    expect(cookiesGet).toHaveBeenCalledWith(SESSION_COOKIE);
  });

  it("returns null for a malformed (non-JWT) cookie value", async () => {
    cookiesGet.mockReturnValue({ value: "not-a-jwt" });
    const getCurrentUser = await importGetCurrentUser();

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("returns null when the token is expired", async () => {
    const token = makeToken({
      sub: "user-1",
      email: "manager@school.dev",
      role: "MANAGER",
      schoolId: "school-1",
      exp: PAST_EXP,
    });
    cookiesGet.mockReturnValue({ value: token });
    const getCurrentUser = await importGetCurrentUser();

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("returns null when the role claim is not MANAGER or TEACHER", async () => {
    const token = makeToken({
      sub: "user-1",
      email: "x@school.dev",
      role: "ADMIN",
      schoolId: "school-1",
      exp: FUTURE_EXP,
    });
    cookiesGet.mockReturnValue({ value: token });
    const getCurrentUser = await importGetCurrentUser();

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("returns the decoded user for a valid, unexpired token", async () => {
    const token = makeToken({
      sub: "user-1",
      email: "manager@school.dev",
      role: "MANAGER",
      schoolId: "school-1",
      exp: FUTURE_EXP,
    });
    cookiesGet.mockReturnValue({ value: token });
    const getCurrentUser = await importGetCurrentUser();

    await expect(getCurrentUser()).resolves.toEqual({
      id: "user-1",
      email: "manager@school.dev",
      role: "MANAGER",
      schoolId: "school-1",
      accessToken: token,
    });
  });
});
