import path from "node:path";
import type { NextConfig } from "next";

/** Baseline web security headers (OWASP / MDN common recommendations). */
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  // HSTS only meaningful on HTTPS production hosts.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // CSP: allow Next / fonts / inline styles used by the docs app.
  // Tighten further when moving third-party scripts behind nonces.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // CDN package assets — long cache + no sniff.
        source: "/cdn/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
