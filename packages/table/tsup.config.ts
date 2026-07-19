import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "lucide-react",
    "@radix-ui/react-slot",
    "@radix-ui/react-checkbox",
    "@radix-ui/react-select",
    "@floating-ui/react",
    "@tanstack/react-virtual",
  ],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});
