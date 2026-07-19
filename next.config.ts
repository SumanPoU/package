import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@itzsa/table", "@itzsa/nepali-input", "@itzsa/editor"],
  // Monorepo includes apps/registry; pin Turbopack root so Next resolves from here.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
