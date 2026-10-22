import type {
  ProductCostQuote,
  ProductPackOption,
  ProductQuantityPrice,
  ProductVariant,
} from "./product-pricing";

export const powerSources = ["pila", "220v", "ninguno"] as const;
export type PowerSource = (typeof powerSources)[number];

export const powerSourceLabels: Record<PowerSource, string> = {
  pila: "A pila",
  "220v": "220V",
  ninguno: "Sin electricidad",
};

export function isPowerSource(value: unknown): value is PowerSource {
  return (
    typeof value === "string" && (powerSources as readonly string[]).includes(value)
  );
}

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
    /** Espesor del material, ej: "1.5cm". */
    thickness: string;
    hasLighting: boolean;
    powerSource: PowerSource;
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
  /**
   * Formatos de venta por pack (ej: x10, x20, x30), cada uno con su precio final.
   * Si tiene elementos, el producto se vende solo por packs.
   */
  packOptions?: ProductPackOption[];
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
  { id: "souvenirs-y-eventos", label: "Souvenirs y Eventos" },
  { id: "juegos-didacticos", label: "Juegos Didácticos" },
  { id: "iluminacion-y-deco", label: "Iluminación y Deco" },
  { id: "cuadros-y-organizadores", label: "Cuadros y Organizadores" },
  { id: "infantil-y-bebes", label: "Infantil y Bebés" },
] as const;

export type GalleryCategoryId = (typeof galleryCategories)[number]["id"];

export const galleryCategoryLabels: Record<Exclude<GalleryCategoryId, "todos">, string> =
  {
    "souvenirs-y-eventos": "Souvenirs y Eventos",
    "juegos-didacticos": "Juegos Didácticos",
    "iluminacion-y-deco": "Iluminación y Deco",
    "cuadros-y-organizadores": "Cuadros y Organizadores",
    "infantil-y-bebes": "Infantil y Bebés",
  };

export type CatalogCategoryId = Exclude<GalleryCategoryId, "todos">;

export const catalogCategories = galleryCategories.filter(
  (category) => category.id !== "todos",
) as { id: CatalogCategoryId; label: string }[];

/**
 * Las temáticas se guardan como slug sin acentos ("cumpleanos"); acá van los
 * nombres con ortografía correcta para mostrarlas.
 */
const topicLabels: Record<string, string> = {
  bebes: "Bebés",
  cumpleanos: "Cumpleaños",
  decoracion: "Decoración",
  didactico: "Didáctico",
  futbol: "Fútbol",
  iluminacion: "Iluminación",
};

export function topicLabel(topic: string) {
  const known = topicLabels[topic];
  if (known) return known;

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
