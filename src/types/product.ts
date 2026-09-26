import type { ProductCostQuote } from "@/features/products/lib/cost-quote";
import type { ProductQuantityPrice } from "@/features/products/lib/quantity-prices";
import type { ProductVariant } from "@/features/products/lib/variants";

export interface Product {
  id?: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  categories: string[];
  topics: string[];
  costQuote?: ProductCostQuote;
  specifications: {
    material: string;
    dimensions: string;
    heightCm?: number;
    widthCm?: number;
    depthCm?: number;
    diameterCm?: number;
    finish: string;
    customizable: boolean;
  };
  featuredImage: string;
  galleryImages: string[];
  price?: number;
  quantityPrices?: ProductQuantityPrice[];
  variants?: ProductVariant[];
  isActive: boolean;
  createdAt: Date | string;
  weightGrams?: number;
  dimensions?: {
    heightCm: number;
    widthCm: number;
    lengthCm: number;
  };
}

export const galleryCategories = [
  { id: "todos", label: "Todos los Productos" },
  { id: "decoracion-hogar", label: "Decoración y Hogar" },
  { id: "infantil-ninos", label: "Infantil, Juegos y Maternidad" },
  { id: "eventos-souvenirs", label: "Eventos, Fiestas y Souvenirs" },
  { id: "organizadores-utilitarios", label: "Organizadores y Utilitarios" },
  { id: "regalos-especiales", label: "Regalos y Frases Personalizadas" },
] as const;

export type GalleryCategoryId = (typeof galleryCategories)[number]["id"];

export const galleryCategoryLabels: Record<Exclude<GalleryCategoryId, "todos">, string> =
  {
    "decoracion-hogar": "Decoración y Hogar",
    "infantil-ninos": "Infantil y Maternidad",
    "eventos-souvenirs": "Eventos y Souvenirs",
    "organizadores-utilitarios": "Organizadores",
    "regalos-especiales": "Regalos",
  };

export type CatalogCategoryId = Exclude<GalleryCategoryId, "todos">;

export const catalogCategories = galleryCategories.filter(
  (category) => category.id !== "todos",
) as { id: CatalogCategoryId; label: string }[];

export function topicLabel(topic: string) {
  return topic
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function categoryLabel(category: string) {
  if (category === "todos") return "Todos los Productos";
  return (
    galleryCategoryLabels[category as Exclude<GalleryCategoryId, "todos">] ??
    topicLabel(category)
  );
}
