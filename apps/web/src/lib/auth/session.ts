import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { SESSION_COOKIE } from "./session-cookie";

export type Role = "MANAGER" | "TEACHER";

export interface CurrentUser {
  id: string;
  email: string;
  role: Role;
  schoolId: string;
  /** Raw JWT — attached as the Bearer header on internal API calls. */
  accessToken: string;
}

interface SessionClaims {
  sub?: string;
  email?: string;
  role?: string;
  schoolId?: string;
  exp?: number;
}

function isRole(value: string | undefined): value is Role {
  return value === "MANAGER" || value === "TEACHER";
}

/**
 * Decode-only, UX layer — mirrors proxy.ts. NOT a security boundary: the
 * NestJS JwtAuthGuard verifies signature + expiry on every real API call,
 * so a forged cookie can only affect which shell renders, never which data
 * is returned. cache()-wrapped so every Server Component in one request
 * tree shares the same decoded value without re-parsing the cookie.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const claims = decodeJwt(token) as SessionClaims;
    if (!claims.sub || !claims.schoolId || !isRole(claims.role)) return null;
    if (claims.exp && claims.exp * 1000 < Date.now()) return null;

    return {
      id: claims.sub,
      email: claims.email ?? "",
      role: claims.role,
      schoolId: claims.schoolId,
      accessToken: token,
    };
  } catch {
    return null;
  }
});
