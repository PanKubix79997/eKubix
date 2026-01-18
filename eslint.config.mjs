// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  // 🔧 Nasze nadpisania reguł
  {
    rules: {
      // pozwala na użycie "any"
      "@typescript-eslint/no-explicit-any": "off",

      // ignorowanie zmiennych/argumentów "_" aby nie było warningów
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // wyłączenie niektórych reguł reactowych jeśli trzeba
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
    },
  },

  // 🔨 Ignorowane foldery
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);
