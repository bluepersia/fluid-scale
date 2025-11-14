export default {
  define: {
    dev: process.env.NODE_ENV !== "production",
  },
  test: {
    globalSetup: ["./test/globalSetup.ts"],
  },
};
