import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/nepal-pay/return",
          "/nepal-pay/khalti-return",
          "/nepal-pay/connectips-return",
          "/page-builder/create",
          "/page-builder/canvas",
          "/page-builder/preview",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/page-builder/create", "/page-builder/canvas"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
