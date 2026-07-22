import { defineConfig, type Options } from "tsup";

const shared: Options = {
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  treeshake: true,
};

export default defineConfig([
  {
    ...shared,
    entry: ["src/index.ts"],
    clean: true,
  },
  {
    ...shared,
    entry: ["src/node/index.ts"],
    outDir: "dist/node",
    clean: false,
  },
  {
    ...shared,
    entry: ["src/node/cli.ts"],
    outDir: "dist/node",
    clean: false,
    dts: false,
    format: ["cjs"],
    esbuildOptions(options) {
      options.banner = {
        js: "#!/usr/bin/env node",
      };
    },
  },
]);
