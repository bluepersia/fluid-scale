export default {
  define: {
    dev: process.env.NODE_ENV !== "production",
  },
  test: {
    setupFiles: ["./test/setup.ts"],
  },
};
