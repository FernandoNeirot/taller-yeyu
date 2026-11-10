import type { MetadataRoute } from "next";
import { productHref } from "@/features/products/lib/product-url";
import { getProductsStrict } from "@/features/products/services/get-products";
import { absoluteUrl } from "@/lib/seo/site";
import type { Product } from "@/types/product";

function productModifiedAt(product: Product) {
  for (const value of [product.updatedAt, product.createdAt]) {
    if (!value) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Si Firestore falla, que falle el sitemap (Google reintenta) en vez de publicar uno vacío.
  const products = (await getProductsStrict()).filter((product) => product.isActive);
  const entries = products.map((product) => ({
    product,
    lastModified: productModifiedAt(product),
  }));

  // Home y galería cambian cuando cambia el catálogo: fecha del producto más reciente.
  const catalogModifiedAt = entries
    .flatMap((entry) => (entry.lastModified ? [entry.lastModified] : []))
    .reduce<Date | undefined>(
      (latest, date) => (!latest || date > latest ? date : latest),
      undefined,
    );

  return [
    {
      url: absoluteUrl("/"),
      lastModified: catalogModifiedAt,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/galeria"),
      lastModified: catalogModifiedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...entries.map(({ product, lastModified }) => ({
      url: absoluteUrl(productHref(product.slug)),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
