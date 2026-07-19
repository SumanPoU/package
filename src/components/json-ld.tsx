import {
  absoluteUrl,
  PACKAGE_ROUTES,
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

export function JsonLd() {
  const software = PACKAGE_ROUTES.flatMap((r) => {
    if (!("packageName" in r) || !r.packageName) return [];
    return [
      {
        "@type": "SoftwareApplication" as const,
        name: r.packageName,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        url: absoluteUrl(r.path),
        description: r.description,
        author: {
          "@type": "Person" as const,
          name: SITE_AUTHOR.name,
          url: SITE_AUTHOR.url,
        },
        offers: {
          "@type": "Offer" as const,
          price: "0",
          priceCurrency: "USD",
        },
      },
    ];
  });

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#person` },
        inLanguage: "en",
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
        sameAs: [SITE_AUTHOR.github],
      },
      ...software,
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
