import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Registry payloads under ./registry are for `shadcn build`, not this app.
  // Excluded via tsconfig; skip ESLint on them during CI builds.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
