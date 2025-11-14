import { build } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const entry = path.resolve(__dirname, "../bundle/src/bundle.ts");
const outfile = path.resolve(__dirname, "../bundle/dist/bundle.js");

fs.rmSync(outfile, { force: true });

await build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  format: "iife",
  globalName: "FluidScale",
  target: "es2020",
  platform: "browser",
  sourcemap: false,
  treeShaking: true,
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  external: ["vitest"],
});

console.log("Built bundle:", outfile);
