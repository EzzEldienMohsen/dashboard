import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement matchMedia; ThemeProvider's device-theme detection
// calls it unconditionally via useSyncExternalStore even when a server-
// resolved theme cookie is present.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}
