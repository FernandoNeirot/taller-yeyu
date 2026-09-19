import { absoluteUrl, type ShareImage } from "@/lib/seo/site";
import type { Product } from "@/types/product";

export function productHref(slug: string) {
  return `/producto/${slug}`;
}

export function productUrl(slug: string) {
  return absoluteUrl(productHref(slug));
}

export function productImageUrl(src: string) {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  return absoluteUrl(src);
}

export function productShareImage(product: Product): ShareImage {
  const url = productImageUrl(product.featuredImage);

  return {
    url,
    secureUrl: url,
    width: 1200,
    height: 630,
    type: "image/png",
    alt: product.title,
  };
}
