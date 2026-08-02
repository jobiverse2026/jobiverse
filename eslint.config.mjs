import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
    // Legacy UI modules are being migrated incrementally. Keep these findings
    // visible in CI without blocking production builds for non-runtime issues.
    rules: {
      "react/no-unescaped-entities": "warn",
      "react-hooks/set-state-in-effect": "warn",
      // Server-rendered date bounds and similar request-time values are valid,
      // while client purity findings remain visible during review.
      "react-hooks/purity": "warn",
    },
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-build/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated campaign artifacts and local render scratch files are not
    // part of the application runtime.
    ".tmp/**",
    "marketing/**",
    "outputs/**",
  ]),
]);

export default eslintConfig;
