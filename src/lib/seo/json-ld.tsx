import { productImageUrl, productUrl } from "@/features/products/lib/product-url";
import type { Product } from "@/types/product";
import { categoryLabel } from "@/types/product";
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
        "@type": ["Organization", "Store"],
        "@id": `${url}/#organization`,
        name: siteConfig.name,
        url,
        description: siteConfig.description,
        sameAs: [siteConfig.instagramUrl],
        areaServed: { "@type": "Country", name: siteConfig.areaServed },
        slogan: siteConfig.tagline,
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
  products: { title: string; description: string; image: string; slug: string }[],
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
            url: productUrl(product.slug),
            name: product.title,
            description: product.description,
            image: product.image,
          })),
        },
      },
    ],
  };
}

/**
 * Precio simple o rango. Un producto puede venderse solo por variantes o packs
 * (sin `price` propio), así que se juntan todos los precios cargados.
 */
function getProductOffers(product: Product, pageUrl: string) {
  const prices = [
    product.price,
    ...(product.variants ?? []).map((variant) => variant.price),
    ...(product.packOptions ?? []).map((pack) => pack.price),
    ...(product.quantityPrices ?? []).map((option) => option.price),
  ].filter((price): price is number => typeof price === "number" && price > 0);

  if (prices.length === 0) return undefined;

  const lowPrice = Math.min(...prices);
  const highPrice = Math.max(...prices);
  const priceValidUntil = new Date(
    Date.now() + 365 * 24 * 60 * 60 * 1000,
  )
    .toISOString()
    .slice(0, 10);
  // El catálogo solo publica productos activos, por eso siempre hay stock.
  const common = {
    url: pageUrl,
    priceCurrency: "ARS",
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    priceValidUntil,
  };

  if (lowPrice === highPrice) {
    return { "@type": "Offer", ...common, price: lowPrice };
  }

  return {
    "@type": "AggregateOffer",
    ...common,
    lowPrice,
    highPrice,
    offerCount: new Set(prices).size,
  };
}

export function getProductJsonLd(product: Product) {
  const url = getSiteUrl();
  const pageUrl = productUrl(product.slug);
  const images = [product.featuredImage, ...product.galleryImages].filter(
    Boolean,
  );
  const uniqueImages = [...new Set(images)].map(productImageUrl);
  const category = product.categories[0];
  const offers = getProductOffers(product, pageUrl);

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
            item: absoluteUrl("/galeria"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.title,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "Product",
        "@id": `${pageUrl}#product`,
        name: product.title,
        description: product.fullDescription || product.shortDescription,
        image: uniqueImages,
        sku: product.slug,
        url: pageUrl,
        brand: {
          "@type": "Brand",
          name: siteConfig.name,
        },
        ...(category ? { category: categoryLabel(category) } : {}),
        ...(offers ? { offers } : {}),
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${product.title} | ${siteConfig.name}`,
        description: product.shortDescription || product.fullDescription,
        inLanguage: siteConfig.language,
        isPartOf: { "@id": `${url}/#website` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: uniqueImages[0] ?? absoluteUrl(siteConfig.ogImagePath),
        },
      },
    ],
  };
}
