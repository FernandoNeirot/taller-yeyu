import type { Product } from "@/types/product";

export const PRODUCT_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const PRODUCT_SEED_REVISION = 3;

type ProductCache = {
  products: Product[];
  fetchedAt: number;
  revision: number;
};

let cache: ProductCache | null = null;

function cloneProduct(product: Product): Product {
  return {
    ...product,
    categories: [...product.categories],
    topics: [...product.topics],
    galleryImages: [...product.galleryImages],
    specifications: { ...product.specifications },
    dimensions: product.dimensions ? { ...product.dimensions } : undefined,
  };
}

function cloneProducts(products: Product[]) {
  return products.map(cloneProduct);
}

function productKey(product: Pick<Product, "id" | "slug">) {
  return product.id ?? product.slug;
}

function sortProducts(products: Product[]) {
  return [...products].sort((a, b) => a.title.localeCompare(b.title, "es"));
}

export function isProductCacheFresh() {
  return (
    cache !== null &&
    cache.revision === PRODUCT_SEED_REVISION &&
    Date.now() - cache.fetchedAt < PRODUCT_CACHE_TTL_MS
  );
}

export function getCachedProducts(): Product[] | null {
  if (!isProductCacheFresh() || !cache) return null;
  return cloneProducts(cache.products);
}

export function getStaleCachedProducts(): Product[] | null {
  if (!cache) return null;
  return cloneProducts(cache.products);
}

export function replaceProductCache(products: Product[]) {
  cache = {
    products: sortProducts(cloneProducts(products)),
    fetchedAt: Date.now(),
    revision: PRODUCT_SEED_REVISION,
  };
}

export function peekCachedProduct(id: string): Product | undefined {
  const found = cache?.products.find(
    (product) => productKey(product) === id || product.slug === id,
  );
  return found ? cloneProduct(found) : undefined;
}

export function upsertCachedProduct(product: Product) {
  if (!cache) return;

  const key = productKey(product);
  const next = cache.products.filter(
    (item) => productKey(item) !== key && item.slug !== product.slug,
  );
  next.push(cloneProduct(product));

  cache = {
    products: sortProducts(next),
    fetchedAt: cache.fetchedAt,
    revision: cache.revision,
  };
}

export function removeCachedProduct(id: string) {
  if (!cache) return;

  cache = {
    products: cache.products.filter(
      (item) => productKey(item) !== id && item.slug !== id,
    ),
    fetchedAt: cache.fetchedAt,
    revision: cache.revision,
  };
}
