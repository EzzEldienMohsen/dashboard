import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server-only": path.resolve(__dirname, "./vitest-stubs/server-only.ts"),
    },
  },
  ssr: {
    // next-intl's client navigation bundle imports "next/navigation" in a
    // way Vite's default externalized SSR resolution can't follow under
    // Vitest — bundling it through Vite's own resolver fixes it.
    noExternal: ["next-intl"],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.d.ts",
        // Framework composition-root files — proven by the Playwright e2e
        // suite, not unit tests. Same rationale as apps/api excluding
        // *.module.ts: wiring is verified by integration tests.
        "src/app/**/page.tsx",
        "src/app/**/layout.tsx",
        "src/app/**/loading.tsx",
        "src/app/**/error.tsx",
        "src/app/global-error.tsx",
        "src/app/icon.tsx",
        "src/app/apple-icon.tsx",
        "src/app/opengraph-image.tsx",
        "src/instrumentation.ts",
        "src/instrumentation-client.ts",
        "src/i18n/routing.ts",
        "src/i18n/navigation.ts",
        "src/i18n/request.ts",
        // next/dynamic wrappers — pure framework wiring, no branching logic.
        "src/components/atoms/BarChart/LazyBarChart.tsx",
        "src/components/atoms/DoughnutChart/LazyDoughnutChart.tsx",
        // Barrel re-exports and type-only files — no logic to test.
        "src/**/index.ts",
        "src/lib/api/types.ts",
        "src/lib/data/types.ts",
        "src/app/**/action-state.ts",
      ],
      thresholds: {
        statements: 95,
        functions: 95,
        lines: 95,
        // Branches are the hardest metric to fully exhaust (defensive
        // catch blocks, ternary edge cases) — apps/api accepts the same
        // reality with an 80% branch floor vs. 95% elsewhere.
        branches: 90,
      },
    },
  },
});
