import path from "node:path";
import type { NextConfig } from "next";

const a11ySrc = path.join(__dirname, "packages/a11y-toolbar/src");

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
  ],
  // Monorepo includes apps/registry; pin Turbopack root so Next resolves from here.
  // Alias source so `next dev` does not depend on packages/a11y-toolbar/dist.
  turbopack: {
    root: path.join(__dirname),
    resolveAlias: {
      "@itzsa/a11y-toolbar/headless": path.join(a11ySrc, "headless.ts"),
      "@itzsa/a11y-toolbar/styles.css": path.join(a11ySrc, "styles.css"),
      "@itzsa/a11y-toolbar": path.join(a11ySrc, "index.ts"),
    },
  },
};

export default nextConfig;
