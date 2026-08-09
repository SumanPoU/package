import {
  absoluteUrl,
  getLocalPackageVersion,
  githubPackageUrl,
  githubRepoUrl,
  npmPackageUrl,
  PACKAGE_CATALOG,
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

/** Site-wide JSON-LD: WebSite, Organization, ItemList of packages. */
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
        "@id": `${absoluteUrl(pkg.path)}#software`,
        name: pkg.packageName,
        alternateName: pkg.alternateName,
        description: pkg.description,
        url: absoluteUrl(pkg.path),
        codeRepository: githubPackageUrl(pkg.packageName),
        programmingLanguage: ["TypeScript", "JavaScript"],
        runtimePlatform: "Node.js",
        downloadUrl: npmPackageUrl(pkg.packageName),
        license: "https://opensource.org/licenses/MIT",
        version: getLocalPackageVersion(pkg.packageName),
        keywords: pkg.keywords.join(", "),
        author: { "@id": `${SITE_URL}/#person` },
        sameAs: [
          npmPackageUrl(pkg.packageName),
          githubPackageUrl(pkg.packageName),
        ],
      },
    })),
  };

  const softwareApps = PACKAGE_CATALOG.map((pkg) => ({
    "@type": ["SoftwareApplication", "WebApplication"] as const,
    "@id": `${absoluteUrl(pkg.path)}#app`,
    name: pkg.packageName,
    alternateName: pkg.alternateName,
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "React Component Library",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    url: absoluteUrl(pkg.path),
    downloadUrl: npmPackageUrl(pkg.packageName),
    installUrl: npmPackageUrl(pkg.packageName),
    softwareVersion: getLocalPackageVersion(pkg.packageName),
    description: pkg.description,
    keywords: pkg.keywords.join(", "),
    license: "https://opensource.org/licenses/MIT",
    codeRepository: githubPackageUrl(pkg.packageName),
    sameAs: [npmPackageUrl(pkg.packageName), githubPackageUrl(pkg.packageName)],
    author: { "@id": `${SITE_URL}/#person` },
    publisher: { "@id": `${SITE_URL}/#organization` },
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
        alternateName: [
          "itzsa component library",
          "@itzsa npm packages",
          "itzsa React packages",
        ],
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: ["en", "ne"],
        keywords: PACKAGE_CATALOG.flatMap((p) => p.keywords.slice(0, 4)).join(
          ", ",
        ),
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: SITE_AUTHOR.name,
        url: SITE_AUTHOR.url,
        email: SITE_AUTHOR.email,
        sameAs: [SITE_AUTHOR.github, SITE_AUTHOR.url, githubRepoUrl()],
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        legalName: "itzsa",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/opengraph-image"),
        },
        founder: { "@id": `${SITE_URL}/#person` },
        sameAs: [
          SITE_AUTHOR.github,
          githubRepoUrl(),
          "https://www.npmjs.com/org/itzsa",
          SITE_AUTHOR.url,
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: SITE_AUTHOR.email,
          url: githubRepoUrl(),
        },
      },
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/#collection`,
        url: SITE_URL,
        name: `${SITE_NAME} packages`,
        description: SITE_DESCRIPTION,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": `${SITE_URL}/#packages` },
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
