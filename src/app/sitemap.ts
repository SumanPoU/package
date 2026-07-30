import type { MetadataRoute } from "next";

import { PACKAGE_CATALOG, PACKAGE_ROUTES, SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const byPath = new Map(PACKAGE_CATALOG.map((p) => [p.path, p]));

  return PACKAGE_ROUTES.map((route) => {
    const pkg = byPath.get(route.path);
    const isHome = route.path === "/";
    return {
      url: `${SITE_URL}${isHome ? "" : route.path}`,
      lastModified: now,
      changeFrequency: isHome ? "weekly" : ("weekly" as const),
      // Home first, then npm package docs near the top of crawl priority.
      priority: isHome ? 1 : (pkg?.priority ?? 0.7),
    };
  });
}
