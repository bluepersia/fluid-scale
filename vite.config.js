export default {
  define: {
    dev: process.env.NODE_ENV !== "production",
  },
  test: {
    testTimeout: 20000,
    setupFiles: ["./test/setup.ts"],
  },
};
