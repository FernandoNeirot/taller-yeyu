import { type DocumentData } from "firebase-admin/firestore";
import type { Product } from "@/types/product";

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function toPrice(value: unknown) {
  if (value == null || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return parsed;
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
  const galleryImages = toStringArray(data.galleryImages ?? data.images);
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
    price: toPrice(data.price),
    isActive: data.isActive !== false && data.available !== false,
    createdAt,
  };
}
