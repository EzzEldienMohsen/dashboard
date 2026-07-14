"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createLoginSchema, createRegisterSchema } from "@/lib/validation/auth.schema";
import { authApiClient } from "@/lib/auth/auth-api-client";
import { mapAuthApiFailureToActionState } from "@/lib/auth/map-auth-api-result";
import type { AuthActionState } from "./action-state";

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE_SECONDS = 60 * 60; // matches JWT_EXPIRES_IN=1h default
const POST_AUTH_REDIRECT = "/dashboard";

async function establishSession(accessToken: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
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
  redirect(POST_AUTH_REDIRECT);
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
  redirect(POST_AUTH_REDIRECT);
}
