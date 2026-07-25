import { defineConfig, type Options } from "tsup";

const shared: Options = {
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  treeshake: true,
  minify: false,
};

export default defineConfig([
  {
    ...shared,
    entry: ["src/index.ts"],
    clean: true,
    external: ["react", "react-dom", "react/jsx-runtime"],
    esbuildOptions(options) {
      // Must be first in the emitted file for Next.js client boundary.
      options.banner = { js: '"use client";' };
    },
  },
  {
    ...shared,
    entry: ["src/headless.ts"],
    clean: false,
    // No React — safe for Server Components / layout FOUC scripts.
  },
]);
