import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { decodeJwt } from "jose";
import { routing } from "@/i18n/routing";
import { SESSION_COOKIE } from "@/lib/auth/session-cookie";

const intlMiddleware = createMiddleware(routing);

/**
 * Decode-only UX check (not a security boundary — see session.ts). A
 * standalone decode rather than importing the cache()-wrapped DAL: proxy
 * runs in a distinct execution context where React's per-request cache()
 * semantics don't apply. Every real data fetch is still gated server-side
 * by the NestJS JwtAuthGuard/RolesGuard regardless of what runs here —
 * per Next's own guidance, Server Actions aren't separate routes in this
 * chain and must re-verify auth themselves rather than relying on proxy.
 */
function readSessionRole(request: NextRequest): string | null {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const claims = decodeJwt(token) as { role?: string; exp?: number };
    if (!claims.role) return null;
    if (claims.exp && claims.exp * 1000 < Date.now()) return null;
    return claims.role;
  } catch {
    return null;
  }
}

/** Strips a confirmed locale prefix (e.g. "/en/dashboard" -> "/dashboard"). */
function stripLocalePrefix(pathname: string): string {
  const match = routing.locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  return match ? pathname.slice(`/${match}`.length) || "/" : pathname;
}

export function proxy(request: NextRequest): NextResponse {
  const intlResponse = intlMiddleware(request);

  // next-intl is redirecting to add/normalize the locale prefix (localePrefix:
  // "always" means every bare path gets one) — let that resolve first; the
  // auth gate below re-runs on the follow-up request once the URL carries a
  // confirmed locale segment, so path-stripping below is always safe.
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse;
  }

  const pathname = request.nextUrl.pathname;
  const path = stripLocalePrefix(pathname);
  const localePrefix = pathname.slice(0, pathname.length - path.length);

  if (path.startsWith("/dashboard")) {
    const role = readSessionRole(request);
    if (!role) {
      return NextResponse.redirect(new URL(`${localePrefix}/login`, request.url));
    }
    if (path === "/dashboard" && role !== "MANAGER") {
      return NextResponse.redirect(new URL(`${localePrefix}/dashboard/classes`, request.url));
    }
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
