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
  });
}

// jsdom doesn't implement IntersectionObserver; framer-motion's `whileInView`
// and `useInView` require it to be present just to mount, even when a test
// doesn't care whether the viewport animation actually fires. Tests that need
// it to actually report an intersection (e.g. animated counters) override
// `window.IntersectionObserver` locally with a version that invokes the
// callback.
if (typeof window !== "undefined" && !window.IntersectionObserver) {
  class NoopIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "";
    readonly thresholds: ReadonlyArray<number> = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  window.IntersectionObserver =
    NoopIntersectionObserver;
}
