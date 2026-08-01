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
    external: ["zod"],
  },
  {
    ...shared,
    entry: ["src/server/index.ts"],
    outDir: "dist/server",
    clean: false,
    external: ["zod", "cheerio", "@prisma/client"],
  },
]);
