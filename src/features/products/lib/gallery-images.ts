import type { Product } from "@/types/product";

export function productGalleryImages(product: Product) {
  const images = [product.featuredImage, ...product.galleryImages].filter(Boolean);
  return [...new Set(images)];
}
