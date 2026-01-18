import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      // Wyłączamy błędy dla any
      "@typescript-eslint/no-explicit-any": "off",

      // Wyłączamy błędy dla nieużywanych zmiennych
      "@typescript-eslint/no-unused-vars": "off",

      // Wyłączamy błąd dla hooków
      "react-hooks/set-state-in-effect": "off",
    },
  },

  // Ignorowanie folderów buildowych
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);
