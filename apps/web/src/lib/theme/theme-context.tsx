"use client";

import {
  createContext,
  startTransition,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { oppositeTheme, type Theme } from "./theme-cookie";
import { setThemeAction } from "./set-theme-action";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DEVICE_DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribeToDeviceTheme(onChange: () => void): () => void {
  const mediaQuery = window.matchMedia(DEVICE_DARK_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getDeviceTheme(): Theme {
  return window.matchMedia(DEVICE_DARK_QUERY).matches
    ? "schooldark"
    : "schoollight";
}

// No cookie means the server can't know the device theme, so CSS
// prefers-color-scheme paints it and this SSR snapshot is only a
// placeholder for the toggle's icon until the client re-syncs post-mount.
function getServerDeviceTheme(): Theme {
  return "schoollight";
}

export interface ThemeProviderProps {
  /** The theme resolved server-side from the cookie; undefined means the
   *  visitor hasn't chosen yet and CSS prefers-color-scheme is driving
   *  the actual paint. */
  initialTheme: Theme | undefined;
  children: ReactNode;
}

/**
 * Owns only in-tab theme state and the optimistic toggle interaction.
 * Persisting the choice (the cookie) and picking the initial value on the
 * server are separate responsibilities, handled by set-theme-action.ts
 * and the root layout respectively.
 */
export function ThemeProvider({ initialTheme, children }: ThemeProviderProps) {
  const [explicitTheme, setExplicitTheme] = useState<Theme | undefined>(
    initialTheme,
  );
  const deviceTheme = useSyncExternalStore(
    subscribeToDeviceTheme,
    getDeviceTheme,
    getServerDeviceTheme,
  );
  const theme = explicitTheme ?? deviceTheme;

  function toggleTheme() {
    const next = oppositeTheme(theme);
    setExplicitTheme(next);
    document.documentElement.dataset.theme = next;
    startTransition(() => {
      void setThemeAction(next);
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
