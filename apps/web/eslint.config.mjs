import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
    },
  },
  {
    // Config/tooling files aren't part of the app's tsconfig project graph.
    files: ["*.config.{js,mjs,ts,mts}", "eslint.config.mjs", "vitest.setup.ts"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      // Mocked object methods (e.g. `vi.mocked(client).get`) trip this rule
      // with false positives when referenced in assertions — same rationale
      // as apps/api's equivalent override for *.spec.ts.
      "@typescript-eslint/unbound-method": "off",
      // False positive on `screen.getByRole(...) as HTMLInputElement`-style
      // narrowing casts — eslint's type info disagrees with tsc here (tsc
      // requires the cast; removing it breaks `tsc --noEmit`).
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
