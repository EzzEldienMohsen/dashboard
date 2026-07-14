"use server";

import { cookies } from "next/headers";
import {
  isTheme,
  THEME_COOKIE,
  THEME_COOKIE_MAX_AGE_SECONDS,
  type Theme,
} from "./theme-cookie";

export async function setThemeAction(theme: Theme): Promise<void> {
  if (!isTheme(theme)) return;

  (await cookies()).set(THEME_COOKIE, theme, {
    path: "/",
    maxAge: THEME_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
  });
}
