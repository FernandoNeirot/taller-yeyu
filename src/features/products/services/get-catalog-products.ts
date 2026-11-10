import type { Product } from "@/types/product";
import { getProducts, getProductsStrict } from "./get-products";

export { mapCatalogDoc } from "./map-catalog-product";

export async function getCatalogProducts(): Promise<Product[]> {
  try {
    const products = await getProducts();
    return products.filter((product) => product.isActive);
  } catch (error) {
    console.error("No se pudieron leer los productos del catálogo.", error);
    return [];
  }
}

export async function getCatalogProduct(slug: string): Promise<Product | null> {
  const products = await getCatalogProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export type CatalogProductLookup =
  | { status: "found"; product: Product }
  /** El slug es un id/slug anterior de un producto activo: redirigir a `slug`. */
  | { status: "moved"; slug: string }
  | { status: "missing" };

/**
 * Busca un producto activo por slug. Si no lo encuentra, prueba con el id del
 * documento (el slug cambia al renombrar un producto, el id no) para poder
 * redirigir las URLs viejas. Si Firestore falla lanza el error en vez de
 * devolver "missing".
 */
export async function lookupCatalogProduct(
  slug: string,
): Promise<CatalogProductLookup> {
  const products = (await getProductsStrict()).filter(
    (product) => product.isActive,
  );
  const product = products.find((item) => item.slug === slug);
  if (product) return { status: "found", product };

  const moved = products.find((item) => item.id === slug);
  if (moved) return { status: "moved", slug: moved.slug };

  return { status: "missing" };
}
