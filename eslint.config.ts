import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import playwright from "eslint-plugin-playwright";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["dist/**/*", "node_modules/**/*"],
  },
  {
    files: ["src/**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { globals: { ...globals.browser, dev: "readonly" } },
  },
  {
    files: [
      "test/**/*.{js,mjs,cjs,ts,mts,cts}",
      "vite.config.{js,ts}",
      "scripts/**/*.{js,ts}",
    ],

    plugins: { js, playwright },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      playwright.configs.recommended,
    ],

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser, // allow document/window inside page.evaluate
        dev: "readonly",
      },
    },
  },
]);
