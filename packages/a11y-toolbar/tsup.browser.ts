import { defineConfig } from "tsup";

/** Run after the main tsup build so `clean: true` cannot wipe this file. */
export default defineConfig({
  entry: { "a11y-toolbar.min": "src/browser.tsx" },
  format: ["iife"],
  globalName: "ItzsaA11yToolbar",
  platform: "browser",
  target: "es2018",
  minify: true,
  sourcemap: true,
  dts: false,
  clean: false,
  noExternal: ["react", "react-dom", "react/jsx-runtime", "scheduler"],
  esbuildOptions(options) {
    options.legalComments = "none";
  },
  outExtension() {
    return { js: ".js" };
  },
});
