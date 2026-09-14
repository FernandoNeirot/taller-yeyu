import { type DocumentData } from "firebase-admin/firestore";
import { initialProducts } from "@/data/initialProducts";
import {
  PRODUCTS_COLLECTION,
  getAdminFirestore,
} from "@/lib/firebase-admin";
import type { Product } from "@/types/product";

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

export function mapCatalogDoc(
  id: string,
  data: DocumentData,
): Product | null {
  if (!Array.isArray(data.categories)) {
    return null;
  }

  const specs =
    data.specifications && typeof data.specifications === "object"
      ? (data.specifications as Record<string, unknown>)
      : {};
  const title = String(data.title ?? "");
  const description = String(data.fullDescription ?? data.description ?? "");
  const featuredImage = String(
    data.featuredImage ?? data.image ?? "/principal.png",
  );
  const galleryImages = toStringArray(data.galleryImages);
  const createdAt = data.createdAt?.toDate?.() ?? data.createdAt ?? "";

  return {
    id,
    title,
    slug: String(data.slug ?? id),
    shortDescription: String(data.shortDescription ?? description),
    fullDescription: description,
    categories: toStringArray(data.categories),
    topics: toStringArray(data.topics),
    specifications: {
      material: String(specs.material ?? data.material ?? ""),
      dimensions: String(specs.dimensions ?? ""),
      finish: String(specs.finish ?? data.finish ?? ""),
      customizable: Boolean(specs.customizable ?? data.customizable),
    },
    featuredImage,
    galleryImages: galleryImages.length > 0 ? galleryImages : [featuredImage],
    price: typeof data.price === "number" ? data.price : undefined,
    isActive: data.isActive !== false && data.available !== false,
    createdAt,
  };
}

export async function getCatalogProducts(): Promise<Product[]> {
  try {
    const snapshot = await getAdminFirestore()
      .collection(PRODUCTS_COLLECTION)
      .get();
    const catalog = snapshot.docs
      .map((doc) => mapCatalogDoc(doc.id, doc.data()))
      .filter((product): product is Product => product !== null && product.isActive)
      .sort((a, b) => a.title.localeCompare(b.title, "es"));

    if (catalog.length > 0) {
      return catalog;
    }
  } catch (error) {
    console.error("No se pudieron leer los productos del catálogo.", error);
  }

  return initialProducts.filter((product) => product.isActive);
}
