"use client";

import { useMemo } from "react";
import { useTheme } from "./theme-context";

/**
 * Resolves daisyUI CSS custom properties (e.g. "--color-success") to their
 * current computed hex/rgb value — Canvas 2D (Chart.js) can't resolve
 * var(...) itself, unlike DOM/CSS. Re-resolves whenever the theme toggles
 * so charts stay in sync with light/dark without a hardcoded color map.
 */
export function useCssColors(varNames: string[]): string[] {
  const { theme } = useTheme();

  return useMemo(() => {
    if (typeof window === "undefined") return varNames.map(() => "transparent");
    const styles = getComputedStyle(document.documentElement);
    return varNames.map((name) => styles.getPropertyValue(name).trim());
    // `theme` is a dependency purely to force re-resolution after toggle —
    // the value itself comes from the live DOM, not from `theme`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [varNames, theme]);
}
