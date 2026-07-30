import {
  absoluteUrl,
  githubPackageUrl,
  npmPackageUrl,
  type PackageSeoEntry,
  SITE_AUTHOR,
  SITE_URL,
} from "@/lib/seo";

/** Per-package JSON-LD for docs pages (SoftwareSourceCode + BreadcrumbList). */
export function PackageJsonLd({ entry }: { entry: PackageSeoEntry }) {
  const pageUrl = absoluteUrl(entry.path);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "itzsa",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: entry.packageName,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "SoftwareSourceCode",
        name: entry.packageName,
        description: entry.description,
        url: pageUrl,
        codeRepository: githubPackageUrl(entry.packageName),
        downloadUrl: npmPackageUrl(entry.packageName),
        programmingLanguage: ["TypeScript", "JavaScript"],
        runtimePlatform: "Node.js",
        license: "https://opensource.org/licenses/MIT",
        keywords: entry.keywords.join(", "),
        author: {
          "@type": "Person",
          name: SITE_AUTHOR.name,
          url: SITE_AUTHOR.url,
        },
        isPartOf: {
          "@type": "SoftwareApplication",
          name: "itzsa",
          url: SITE_URL,
        },
      },
      {
        "@type": "TechArticle",
        headline: entry.title,
        description: entry.description,
        url: pageUrl,
        author: {
          "@type": "Person",
          name: SITE_AUTHOR.name,
          url: SITE_AUTHOR.url,
        },
        mainEntityOfPage: pageUrl,
        keywords: entry.keywords.join(", "),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
