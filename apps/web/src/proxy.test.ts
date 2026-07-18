import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session-cookie";

// The inner middleware function next-intl's createMiddleware(routing) would
// normally produce. proxy.ts calls createMiddleware once at module scope, so
// we keep a stable reference here and reconfigure its behavior per test
// rather than re-mocking createMiddleware itself. vi.hoisted is required
// because vi.mock's factory is hoisted above regular top-level declarations.
const { intlMiddlewareMock } = vi.hoisted(() => ({
  intlMiddlewareMock: vi.fn(),
}));

vi.mock("next-intl/middleware", () => ({
  default: vi.fn(() => intlMiddlewareMock),
}));

import { proxy } from "./proxy";

function makeToken(claims: Record<string, unknown>): string {
  const encode = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  return `${encode({ alg: "none" })}.${encode(claims)}.signature`;
}

const FUTURE_EXP = Math.floor(Date.now() / 1000) + 3600;
const PAST_EXP = Math.floor(Date.now() / 1000) - 3600;

function buildRequest(path: string, token?: string): NextRequest {
  const headers = new Headers();
  if (token) headers.set("cookie", `${SESSION_COOKIE}=${token}`);
  return new NextRequest(new URL(`http://localhost${path}`), { headers });
}

describe("proxy", () => {
  beforeEach(() => {
    intlMiddlewareMock.mockReset();
    intlMiddlewareMock.mockImplementation(() => NextResponse.next());
  });

  it("redirects to /en/login when there is no session cookie", () => {
    const request = buildRequest("/en/dashboard");

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/en/login");
  });

  it("passes through for a valid MANAGER session on /en/dashboard", () => {
    const token = makeToken({ role: "MANAGER", exp: FUTURE_EXP });
    const request = buildRequest("/en/dashboard", token);

    const response = proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects a valid TEACHER session away from the exact /en/dashboard path", () => {
    const token = makeToken({ role: "TEACHER", exp: FUTURE_EXP });
    const request = buildRequest("/en/dashboard", token);

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/en/dashboard/classes");
  });

  it("does not redirect a TEACHER session on a dashboard sub-path", () => {
    const token = makeToken({ role: "TEACHER", exp: FUTURE_EXP });
    const request = buildRequest("/en/dashboard/classes", token);

    const response = proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("treats an expired JWT as no session and redirects to login", () => {
    const token = makeToken({ role: "MANAGER", exp: PAST_EXP });
    const request = buildRequest("/en/dashboard", token);

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/en/login");
  });

  it("uses the ar locale prefix when redirecting to login", () => {
    const request = buildRequest("/ar/dashboard");

    const response = proxy(request);

    expect(response.headers.get("location")).toBe("http://localhost/ar/login");
  });

  it("returns the intl middleware's redirect response as-is, skipping the auth check entirely", () => {
    const intlRedirect = NextResponse.redirect(new URL("http://localhost/en/dashboard"), 307);
    intlMiddlewareMock.mockImplementation(() => intlRedirect);

    // No session cookie at all: if the auth check ran on this normalized
    // "/en/dashboard" path, it would redirect to /en/login instead of
    // returning the intl response untouched.
    const request = buildRequest("/en/dashboard");

    const response = proxy(request);

    expect(response).toBe(intlRedirect);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/en/dashboard");
  });

  it("also short-circuits on a 308 intl response", () => {
    const intlRedirect = NextResponse.redirect(new URL("http://localhost/en/dashboard"), 308);
    intlMiddlewareMock.mockImplementation(() => intlRedirect);

    const request = buildRequest("/en/dashboard");

    const response = proxy(request);

    expect(response).toBe(intlRedirect);
    expect(response.status).toBe(308);
  });

  it("passes through non-dashboard paths without invoking the auth check", () => {
    const request = buildRequest("/en/about");

    const response = proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
