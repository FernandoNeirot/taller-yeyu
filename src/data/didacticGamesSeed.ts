// Datos puros (sin alias "@/"): los importa la app y también scripts/seed-juegos-didacticos.mjs.
import { finalizeCostQuote } from "../features/materials/lib/quote-items.ts";
import type { QuoteItemInput } from "../features/materials/lib/quote-items.ts";
import type { Product } from "../types/product";
import { initialMaterials, MATERIAL_IDS } from "./initialMaterials.ts";

export type DidacticGameSeed = Omit<
  Product,
  "id" | "featuredImage" | "galleryImages" | "isActive" | "createdAt"
>;

/** Packs de 6 a 30 unidades, cada vez con más descuento por unidad. */
const PACK_QUANTITIES = [6, 12, 18, 24, 30] as const;
const PACK_DISCOUNTS = [0, 0.05, 0.08, 0.11, 0.14] as const;

/**
 * Precio final de cada pack a partir del precio por unidad del pack más chico.
 * Con packs, el precio base del producto es el del pack más chico.
 */
function packPricing(unitPrice: number) {
  const packOptions = PACK_QUANTITIES.map((quantity, index) => ({
    quantity,
    price:
      Math.round((unitPrice * quantity * (1 - PACK_DISCOUNTS[index])) / 100) * 100,
  }));
  return { price: packOptions[0].price, packOptions };
}

function costQuoteFor(items: QuoteItemInput[]) {
  return finalizeCostQuote(items, initialMaterials);
}

const { mdf, laser } = MATERIAL_IDS;
const bag = "bolsita-9x20";
const stickers = "papel-autoadhesivo";
const images = "imagenes";

const topics = ["didactico", "infantil", "juegos"];

/** Se venden solo por packs: tienen `packOptions`, que es lo que define "pack". */
export const didacticGameSeeds: DidacticGameSeed[] = [
  {
    title: "Tateti 9x9",
    slug: "tateti-9x9",
    shortDescription:
      "Tateti de MDF de 9x9 cm con fichas caladas, ideal para souvenirs y regalos.",
    fullDescription:
      "Mini tateti de MDF de 9x9 cm con tablero calado y fichas de dos formas distintas para jugar en cualquier lado. Se entrega en bolsita individual. Se vende en packs de 6 a 30 unidades, con mejor precio por unidad a mayor cantidad: ideal para souvenirs de cumpleaños y fiestas.",
    categories: ["juegos-didacticos"],
    topics: [...topics, "souvenirs"],
    specifications: {
      material: "MDF 3mm",
      dimensions: "9x9 cm",
      thickness: "3mm",
      hasLighting: false,
      powerSource: "ninguno",
      heightCm: 9,
      widthCm: 9,
      finish: "Grabado láser",
      customizable: true,
    },
    ...packPricing(3200),
    weightGrams: 60,
    dimensions: { heightCm: 9, widthCm: 9, lengthCm: 1 },
    costQuote: costQuoteFor([
      { materialId: mdf, widthCm: 9, heightCm: 18 },
      { materialId: laser, quantityUsed: 4 },
      { materialId: bag, quantityUsed: 1 },
    ]),
  },
  {
    title: "Tangram 9x9",
    slug: "tangram-9x9",
    shortDescription:
      "Tangram de MDF de 9x9 cm con las 7 piezas clásicas para armar figuras.",
    fullDescription:
      "Tangram de MDF de 9x9 cm con las 7 piezas clásicas, cortadas a láser con precisión, para armar figuras y desarrollar la lógica y la imaginación. Se entrega en bolsita individual. Se vende en packs de 6 a 30 unidades, con mejor precio por unidad a mayor cantidad.",
    categories: ["juegos-didacticos"],
    topics: [...topics, "logica"],
    specifications: {
      material: "MDF 3mm",
      dimensions: "9x9 cm",
      thickness: "3mm",
      hasLighting: false,
      powerSource: "ninguno",
      heightCm: 9,
      widthCm: 9,
      finish: "Corte láser",
      customizable: true,
    },
    ...packPricing(2800),
    weightGrams: 45,
    dimensions: { heightCm: 9, widthCm: 9, lengthCm: 1 },
    costQuote: costQuoteFor([
      { materialId: mdf, widthCm: 9, heightCm: 9 },
      { materialId: laser, quantityUsed: 3 },
      { materialId: bag, quantityUsed: 1 },
    ]),
  },
  {
    title: "Rompecabezas 9x9",
    slug: "rompecabezas-9x9",
    shortDescription:
      "Rompecabezas de MDF de 9x9 cm con la imagen que elijas, en bolsita individual.",
    fullDescription:
      "Rompecabezas de MDF de 9x9 cm con imagen impresa a elección (personajes, animales, nombres o fotos), con piezas cortadas a láser. Se entrega en bolsita individual. Se vende en packs de 6 a 30 unidades, con mejor precio por unidad a mayor cantidad: ideal para souvenirs infantiles.",
    categories: ["juegos-didacticos"],
    topics: [...topics, "souvenirs", "personalizado"],
    specifications: {
      material: "MDF 3mm",
      dimensions: "9x9 cm",
      thickness: "3mm",
      hasLighting: false,
      powerSource: "ninguno",
      heightCm: 9,
      widthCm: 9,
      finish: "Impresión full color",
      customizable: true,
    },
    ...packPricing(3800),
    weightGrams: 55,
    dimensions: { heightCm: 9, widthCm: 9, lengthCm: 1 },
    costQuote: costQuoteFor([
      { materialId: mdf, widthCm: 9, heightCm: 9 },
      { materialId: stickers, widthCm: 9, heightCm: 9 },
      { materialId: images, quantityUsed: 1 },
      { materialId: laser, quantityUsed: 5 },
      { materialId: bag, quantityUsed: 1 },
    ]),
  },
  {
    title: "Memotest 9x9",
    slug: "memotest-9x9",
    shortDescription:
      "Memotest de MDF con fichas ilustradas para guardar en una bolsita de 9x9 cm.",
    fullDescription:
      "Memotest de MDF con fichas ilustradas con la temática que prefieras (animales, personajes, letras o números), pensado para guardar en una bolsita individual de 9x9 cm. Trabaja la memoria y la atención. Se vende en packs de 6 a 30 unidades, con mejor precio por unidad a mayor cantidad.",
    categories: ["juegos-didacticos"],
    topics: [...topics, "memoria"],
    specifications: {
      material: "MDF 3mm",
      dimensions: "Fichas para bolsita de 9x9 cm",
      thickness: "3mm",
      hasLighting: false,
      powerSource: "ninguno",
      heightCm: 9,
      widthCm: 9,
      finish: "Impresión full color",
      customizable: true,
    },
    ...packPricing(4200),
    weightGrams: 90,
    dimensions: { heightCm: 9, widthCm: 9, lengthCm: 2 },
    costQuote: costQuoteFor([
      { materialId: mdf, widthCm: 9, heightCm: 20 },
      { materialId: stickers, widthCm: 9, heightCm: 20 },
      { materialId: images, quantityUsed: 2 },
      { materialId: laser, quantityUsed: 7 },
      { materialId: bag, quantityUsed: 1 },
    ]),
  },
];
