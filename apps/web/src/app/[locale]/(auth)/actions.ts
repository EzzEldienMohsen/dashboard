"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";
import { decodeJwt } from "jose";
import { getLocale, getTranslations } from "next-intl/server";
import { createLoginSchema, createRegisterSchema } from "@/lib/validation/auth.schema";
import { authApiClient } from "@/lib/auth/auth-api-client";
import { mapAuthApiFailureToActionState } from "@/lib/auth/map-auth-api-result";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session-cookie";
import type { AuthActionState } from "./action-state";

async function establishSession(accessToken: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** /dashboard is MANAGER-only — a fresh Teacher login must not land there. */
function postAuthRedirectPath(accessToken: string): string {
  const { role } = decodeJwt(accessToken) as { role?: string };
  return role === "TEACHER" ? "/dashboard/classes" : "/dashboard";
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  const locale = await getLocale();
  redirect({ href: "/login", locale });
}

function toFieldErrors<T extends Record<string, unknown>>(
  error: z.ZodError<T>,
): Record<string, string> {
  const flattened = z.flattenError(error).fieldErrors;
  const fieldErrors: Record<string, string> = {};
  for (const [key, messages] of Object.entries(flattened)) {
    if (messages?.[0]) fieldErrors[key] = messages[0];
  }
  return fieldErrors;
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const t = await getTranslations("auth.validation");
  const registerSchema = createRegisterSchema(t);
  const parsed = registerSchema.safeParse({
    role: formData.get("role"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    country: formData.get("country"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error) };
  }

  const result = await authApiClient.register(parsed.data);
  if (!result.ok) {
    const tErrors = await getTranslations("auth.apiErrors");
    return mapAuthApiFailureToActionState(result, tErrors);
  }

  await establishSession(result.accessToken);
  const locale = await getLocale();
  return redirect({ href: postAuthRedirectPath(result.accessToken), locale });
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const t = await getTranslations("auth.validation");
  const loginSchema = createLoginSchema(t);
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error) };
  }

  const result = await authApiClient.login(parsed.data);
  if (!result.ok) {
    const tErrors = await getTranslations("auth.apiErrors");
    return mapAuthApiFailureToActionState(result, tErrors);
  }

  await establishSession(result.accessToken);
  const locale = await getLocale();
  return redirect({ href: postAuthRedirectPath(result.accessToken), locale });
}
