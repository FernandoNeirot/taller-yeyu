import {
  galleryCategories,
  type GalleryCategoryId,
} from "@/types/product";

export type GalleryFiltersState = {
  categoria?: string;
  topic?: string;
  producto?: string;
};

export function parseGalleryCategory(
  value?: string | null,
): GalleryCategoryId {
  if (galleryCategories.some((category) => category.id === value)) {
    return value as GalleryCategoryId;
  }

  return "todos";
}

export function firstSearchParam(value?: string | string[] | null) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function galleryHref({
  categoria,
  topic,
  producto,
}: GalleryFiltersState) {
  const params = new URLSearchParams();

  if (categoria && categoria !== "todos") {
    params.set("categoria", categoria);
  }

  if (topic) {
    params.set("topic", topic);
  }

  if (producto) {
    params.set("producto", producto);
  }

  const query = params.toString();
  return query ? `/galeria?${query}` : "/galeria";
}
