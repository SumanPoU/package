import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: [
    "@itzsa/table",
    "@itzsa/nepali-input",
    "@itzsa/editor",
    "@itzsa/nepali-datepicker",
    "@itzsa/nepal-geo",
    "@itzsa/nepal-geo-data",
    "@itzsa/a11y-toolbar",
    "@itzsa/captcha",
  ],
  // Monorepo includes apps/registry; pin Turbopack root so Next resolves from here.
  // Use posix-relative aliases — Turbopack on Windows rejects absolute `E:\...` paths
  // ("windows imports are not implemented yet").
  turbopack: {
    root: path.join(__dirname),
    resolveAlias: {
      "@itzsa/a11y-toolbar/headless": "./packages/a11y-toolbar/src/headless.ts",
      "@itzsa/a11y-toolbar/styles.css":
        "./packages/a11y-toolbar/src/styles.css",
      "@itzsa/a11y-toolbar": "./packages/a11y-toolbar/src/index.ts",
      "@itzsa/captcha": "./packages/captcha/src/index.ts",
    },
  },
};

export default nextConfig;
