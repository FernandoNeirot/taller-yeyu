import { type DocumentData } from "firebase-admin/firestore";
import { isPowerSource, type Product } from "@/types/product";
import { mapStoredCostQuote } from "@/features/materials/lib/quote-items";
import { normalizePackOptions } from "../lib/packs";
import { normalizeQuantityPrices } from "../lib/quantity-prices";
import { normalizeVariants } from "../lib/variants";

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
  // Sin repetidas: la URL es la identidad de cada foto en la galería y en el formulario.
  const galleryImages = [
    ...new Set(toStringArray(data.galleryImages ?? data.images)),
  ];
  // ISO string: el resultado pasa por la caché de Next, que serializa a JSON.
  const createdAtDate = data.createdAt?.toDate?.();
  const createdAt: string = createdAtDate
    ? createdAtDate.toISOString()
    : String(data.createdAt ?? "");
  const weightGrams = toPrice(data.weightGrams);
  const packageSize =
    data.dimensions && typeof data.dimensions === "object"
      ? (data.dimensions as Record<string, unknown>)
      : null;
  const heightCm = toPrice(packageSize?.heightCm);
  const widthCm = toPrice(packageSize?.widthCm);
  const lengthCm = toPrice(packageSize?.lengthCm);

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
      thickness: String(specs.thickness ?? ""),
      hasLighting: Boolean(specs.hasLighting),
      powerSource: isPowerSource(specs.powerSource)
        ? specs.powerSource
        : "ninguno",
      heightCm: toPrice(specs.heightCm),
      widthCm: toPrice(specs.widthCm),
      depthCm: toPrice(specs.depthCm),
      diameterCm: toPrice(specs.diameterCm),
      finish: String(specs.finish ?? data.finish ?? ""),
      customizable: Boolean(specs.customizable ?? data.customizable),
    },
    featuredImage,
    galleryImages: galleryImages.length > 0 ? galleryImages : [featuredImage],
    price: toPrice(data.price),
    packOptions: normalizePackOptions(data.packOptions),
    quantityPrices: normalizeQuantityPrices(data.quantityPrices),
    variants: normalizeVariants(data.variants),
    costQuote: mapStoredCostQuote(data.costQuote),
    isActive: data.isActive !== false && data.available !== false,
    createdAt,
    weightGrams,
    dimensions:
      heightCm && widthCm && lengthCm
        ? { heightCm, widthCm, lengthCm }
        : undefined,
  };
}
