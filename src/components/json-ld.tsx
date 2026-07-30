import {
  absoluteUrl,
  githubPackageUrl,
  npmPackageUrl,
  PACKAGE_CATALOG,
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

/** Site-wide JSON-LD: WebSite, Organization, ItemList of packages (packages first). */
export function JsonLd() {
  const itemList = {
    "@type": "ItemList" as const,
    "@id": `${SITE_URL}/#packages`,
    name: `${SITE_NAME} npm packages`,
    description:
      "Installable React and TypeScript packages published as @itzsa/* on npm.",
    numberOfItems: PACKAGE_CATALOG.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: PACKAGE_CATALOG.map((pkg, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name: pkg.packageName,
      url: absoluteUrl(pkg.path),
      description: pkg.description,
      item: {
        "@type": "SoftwareSourceCode" as const,
        name: pkg.packageName,
        description: pkg.description,
        url: absoluteUrl(pkg.path),
        codeRepository: githubPackageUrl(pkg.packageName),
        programmingLanguage: ["TypeScript", "JavaScript"],
        runtimePlatform: "Node.js",
        downloadUrl: npmPackageUrl(pkg.packageName),
        license: "https://opensource.org/licenses/MIT",
        author: { "@id": `${SITE_URL}/#person` },
      },
    })),
  };

  const softwareApps = PACKAGE_CATALOG.map((pkg) => ({
    "@type": "SoftwareApplication" as const,
    name: pkg.packageName,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: absoluteUrl(pkg.path),
    downloadUrl: npmPackageUrl(pkg.packageName),
    softwareVersion: "latest",
    description: pkg.description,
    keywords: pkg.keywords.join(", "),
    author: {
      "@type": "Person" as const,
      name: SITE_AUTHOR.name,
      url: SITE_AUTHOR.url,
    },
    offers: {
      "@type": "Offer" as const,
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  }));

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: ["en", "ne"],
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: SITE_AUTHOR.name,
        url: SITE_AUTHOR.url,
        sameAs: [SITE_AUTHOR.github, SITE_AUTHOR.url],
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: absoluteUrl("/opengraph-image"),
        founder: { "@id": `${SITE_URL}/#person` },
        sameAs: [SITE_AUTHOR.github, "https://www.npmjs.com/org/itzsa"],
      },
      itemList,
      ...softwareApps,
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
