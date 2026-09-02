import { PRODUCTS_COLLECTION, getAdminFirestore } from "@/lib/firebase/admin";
import type { Product, ProductCategory } from "./types";

function isCategory(value: unknown): value is ProductCategory {
  return value === "iluminacion" || value === "kits" || value === "souvenirs";
}

export async function getProducts(): Promise<Product[]> {
  let snapshot;

  try {
    snapshot = await getAdminFirestore()
      .collection(PRODUCTS_COLLECTION)
      .orderBy("title")
      .get();
  } catch (error) {
    console.error("No se pudieron leer los productos de Firestore.", error);
    return [];
  }

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      slug: String(data.slug ?? doc.id),
      title: String(data.title ?? ""),
      description: String(data.description ?? ""),
      category: isCategory(data.category) ? data.category : "souvenirs",
      tag: String(data.tag ?? ""),
      alt: String(data.alt ?? data.title ?? ""),
      image: String(data.image ?? ""),
      images: Array.isArray(data.images) ? data.images.map(String) : [],
      material: String(data.material ?? "Madera"),
      finish: String(data.finish ?? ""),
      customizable: Boolean(data.customizable),
      featured: Boolean(data.featured),
      available: data.available !== false,
      stock: typeof data.stock === "number" ? data.stock : null,
      price: typeof data.price === "number" ? data.price : null,
      currency: "ARS",
      searchText: String(data.searchText ?? `${data.title} ${data.description}`),
    };
  });
}
