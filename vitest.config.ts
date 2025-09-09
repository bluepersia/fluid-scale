// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./test/golden-state/init.ts"], // <-- runs at start
    // or setupFilesAfterEnv: ['./test/setupAfterEnv.ts'],
  },
});
