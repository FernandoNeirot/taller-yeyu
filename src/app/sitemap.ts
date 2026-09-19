import type { MetadataRoute } from "next";
import { productHref } from "@/features/products/lib/product-url";
import { getCatalogProducts } from "@/features/products/services/get-catalog-products";
import { absoluteUrl } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await getCatalogProducts();

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/galeria"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...products.map((product) => ({
      url: absoluteUrl(productHref(product.slug)),
      lastModified: product.createdAt ? new Date(product.createdAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
