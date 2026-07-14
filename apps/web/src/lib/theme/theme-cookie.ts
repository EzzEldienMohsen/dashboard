export type Theme = "schoollight" | "schooldark";

export const THEME_COOKIE = "theme";
export const THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const THEMES = ["schoollight", "schooldark"] as const;

export function isTheme(value: string | undefined | null): value is Theme {
  return !!value && (THEMES as readonly string[]).includes(value);
}

/**
 * Returns undefined when there's no valid cookie yet. Callers must treat
 * that as "let CSS prefers-color-scheme decide" rather than defaulting to
 * a specific theme — that's what keeps first-time visitors flash-free and
 * device-accurate with zero JS.
 */
export function resolveTheme(
  cookieValue: string | undefined,
): Theme | undefined {
  return isTheme(cookieValue) ? cookieValue : undefined;
}

export function oppositeTheme(theme: Theme): Theme {
  return theme === "schoollight" ? "schooldark" : "schoollight";
}
