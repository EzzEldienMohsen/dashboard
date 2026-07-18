// Vitest can't resolve the real "server-only" package (it relies on
// Next's build-time handling to throw when imported client-side) — this
// no-op stub lets modules that `import "server-only"` load under Vitest.
export {};
