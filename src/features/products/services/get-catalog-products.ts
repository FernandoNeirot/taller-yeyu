import { initialProducts } from "@/data/initialProducts";
import type { Product } from "@/types/product";
import { getProducts } from "./get-products";

export { mapCatalogDoc } from "./map-catalog-product";

export async function getCatalogProducts(): Promise<Product[]> {
  try {
    const products = await getProducts();
    if (products.length > 0) {
      return products.filter((product) => product.isActive);
    }
  } catch (error) {
    console.error("No se pudieron leer los productos del catálogo.", error);
  }

  return initialProducts.filter((product) => product.isActive);
}

export async function getCatalogProduct(slug: string): Promise<Product | null> {
  const products = await getCatalogProducts();
  return products.find((product) => product.slug === slug) ?? null;
}
