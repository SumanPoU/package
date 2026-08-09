import {
  absoluteUrl,
  getLocalPackageVersion,
  githubPackageUrl,
  npmPackageUrl,
  type PackageSeoEntry,
  SITE_AUTHOR,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

/** Per-package JSON-LD: SoftwareSourceCode + SoftwareApplication + HowTo + Breadcrumb. */
export function PackageJsonLd({ entry }: { entry: PackageSeoEntry }) {
  const pageUrl = absoluteUrl(entry.path);
  const version = getLocalPackageVersion(entry.packageName);
  const npmUrl = npmPackageUrl(entry.packageName);
  const githubUrl = githubPackageUrl(entry.packageName);

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: SITE_NAME,
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
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: entry.title,
        description: entry.description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${pageUrl}#software` },
        primaryImageOfPage: absoluteUrl("/opengraph-image"),
        inLanguage: "en",
        keywords: entry.keywords.join(", "),
      },
      {
        "@type": "SoftwareSourceCode",
        "@id": `${pageUrl}#software`,
        name: entry.packageName,
        alternateName: entry.alternateName,
        description: entry.description,
        url: pageUrl,
        codeRepository: githubUrl,
        downloadUrl: npmUrl,
        programmingLanguage: ["TypeScript", "JavaScript"],
        runtimePlatform: "Node.js",
        license: "https://opensource.org/licenses/MIT",
        version,
        keywords: entry.keywords.join(", "),
        author: {
          "@type": "Person",
          name: SITE_AUTHOR.name,
          url: SITE_AUTHOR.url,
        },
        sameAs: [npmUrl, githubUrl],
        isPartOf: {
          "@type": "SoftwareApplication",
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
      {
        "@type": ["SoftwareApplication", "WebApplication"],
        "@id": `${pageUrl}#app`,
        name: entry.packageName,
        alternateName: entry.alternateName,
        applicationCategory: "DeveloperApplication",
        applicationSubCategory: "React Component Library",
        operatingSystem: "Any",
        url: pageUrl,
        downloadUrl: npmUrl,
        installUrl: npmUrl,
        softwareVersion: version,
        description: entry.description,
        keywords: entry.keywords.join(", "),
        license: "https://opensource.org/licenses/MIT",
        codeRepository: githubUrl,
        sameAs: [npmUrl, githubUrl],
        author: {
          "@type": "Person",
          name: SITE_AUTHOR.name,
          url: SITE_AUTHOR.url,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
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
        about: { "@id": `${pageUrl}#software` },
      },
      {
        "@type": "HowTo",
        name: `Install ${entry.packageName}`,
        description: `Install the ${entry.packageName} package from npm and import it in React.`,
        totalTime: "PT2M",
        supply: [
          {
            "@type": "HowToSupply",
            name: "Node.js 18+",
          },
          {
            "@type": "HowToSupply",
            name: "pnpm, npm, or yarn",
          },
        ],
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Install the package",
            text: `Run pnpm add ${entry.packageName} (or npm install ${entry.packageName}).`,
            url: `${pageUrl}#installation`,
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Import and use",
            text: `Import components from ${entry.packageName} in your React or Next.js app. See the docs for API and examples.`,
            url: pageUrl,
          },
        ],
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
