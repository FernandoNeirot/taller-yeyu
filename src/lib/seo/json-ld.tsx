import { absoluteUrl, getSiteUrl, getTelephone, siteConfig } from "./site";

type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

export function JsonLd({ data }: { data: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function getSiteJsonLd() {
  const url = getSiteUrl();
  const telephone = getTelephone();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: siteConfig.name,
        url,
        description: siteConfig.description,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl(siteConfig.logoPath),
        },
        image: absoluteUrl(siteConfig.ogImagePath),
        ...(telephone
          ? {
              telephone,
              contactPoint: {
                "@type": "ContactPoint",
                telephone,
                contactType: "customer service",
                availableLanguage: ["Spanish"],
              },
            }
          : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: siteConfig.name,
        description: siteConfig.description,
        inLanguage: siteConfig.language,
        publisher: { "@id": `${url}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url,
        name: siteConfig.title,
        description: siteConfig.description,
        inLanguage: siteConfig.language,
        isPartOf: { "@id": `${url}/#website` },
        about: { "@id": `${url}/#organization` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: absoluteUrl(siteConfig.ogImagePath),
        },
      },
    ],
  };
}

export function getGalleryJsonLd(
  products: { title: string; description: string; image: string }[],
) {
  const url = getSiteUrl();
  const pageUrl = absoluteUrl("/galeria");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Galería",
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "Galería | Taller Yeyu",
        description:
          "Inspiración y arte en cada pieza personalizada de Taller Yeyu.",
        inLanguage: siteConfig.language,
        isPartOf: { "@id": `${url}/#website` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: absoluteUrl(siteConfig.ogImagePath),
        },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: products.length,
          itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: product.title,
            description: product.description,
            image: product.image,
          })),
        },
      },
    ],
  };
}
