import { catalogCategories } from "@/types/product";
import {
  DEFAULT_LABOR_HOURLY_RATE,
  DEFAULT_MACHINE_HOURLY_RATE,
  isWoodFaceType,
  type WoodFaceType,
} from "./cost-quote";

export const PRODUCT_CREATE_JSON_EXAMPLE = `{
  "title": "Cartel de bienvenida",
  "shortDescription": "Cartel calado para la entrada del evento.",
  "fullDescription": "Cartel de madera cortado a láser, pensado para apoyar o colgar. Se personaliza con el nombre y la fecha.",
  "categories": ["eventos-souvenirs"],
  "topics": ["cumpleaños", "bienvenida"],
  "heightCm": 40,
  "widthCm": 30,
  "depthCm": 0.3,
  "diameterCm": null,
  "finish": "Madera natural",
  "customizable": true,
  "hidden": false,
  "price": 15000,
  "quantityPrices": [
    { "quantity": 5, "price": 65000 }
  ],
  "variants": [
    { "description": "Pintado", "price": 18000 }
  ],
  "costQuote": {
    "woods": [
      { "quantity": 1, "widthCm": 30, "lengthCm": 40, "face": "natural" }
    ],
    "machineMinutes": 12,
    "machineHourlyRate": 6000,
    "laborMinutes": 20,
    "laborHourlyRate": 4000,
    "accessories": [],
    "usesPaint": false,
    "paintAmount": null
  }
}`;

export type ParsedProductCreateJson = {
  title: string;
  shortDescription: string;
  fullDescription: string;
  categories: string[];
  topics: string;
  dimensions: string;
  heightCm: string;
  widthCm: string;
  depthCm: string;
  diameterCm: string;
  finish: string;
  customizable: boolean;
  hidden: boolean;
  price: string;
  quantityPrices: { quantity: string; price: string }[];
  variants: { description: string; price: string }[];
  costQuote: {
    woods: {
      quantity: string;
      widthCm: string;
      lengthCm: string;
      face: "" | WoodFaceType;
    }[];
    machineMinutes: string;
    machineHourlyRate: string;
    laborMinutes: string;
    laborHourlyRate: string;
    accessories: { materialId: string; materialName: string; quantity: string }[];
    usesPaint: boolean;
    paintAmount: string;
  } | null;
};

const categoryIds = catalogCategories.map((category) => category.id).join(", ");

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

const categoryByKey = new Map<string, string>();
for (const category of catalogCategories) {
  categoryByKey.set(normalizeKey(category.id), category.id);
  categoryByKey.set(normalizeKey(category.label), category.id);
}

function unwrapJson(raw: string) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced?.[1]?.trim() || trimmed;
}

function asRecord(value: unknown, label: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} tiene que ser un objeto.`);
  }
  return value as Record<string, unknown>;
}

function text(value: unknown) {
  if (value == null) return "";
  return String(value).trim();
}

function optionalNumber(value: unknown, label: string) {
  if (value == null || value === "") return "";
  const parsed = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${label} no es un número válido.`);
  }
  return String(parsed);
}

function positivePrice(value: unknown, label: string) {
  const raw = optionalNumber(value, label);
  if (!raw || Number(raw) <= 0) return "";
  return raw;
}

function topicsText(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => text(item)).filter(Boolean).join(", ");
  }
  return text(value);
}

function categoriesFrom(value: unknown) {
  const source = Array.isArray(value)
    ? value
    : text(value)
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
  const categories: string[] = [];
  const unknown: string[] = [];
  for (const item of source) {
    const match = categoryByKey.get(normalizeKey(String(item)));
    if (!match) {
      unknown.push(String(item));
      continue;
    }
    if (!categories.includes(match)) categories.push(match);
  }
  if (unknown.length > 0 && categories.length === 0) {
    throw new Error(
      `La categoría no es válida (${unknown.join(", ")}). Usá: ${categoryIds}.`,
    );
  }
  if (categories.length === 0) {
    throw new Error(`Elegí al menos una categoría. Usá: ${categoryIds}.`);
  }
  return { categories, unknown };
}

export function parseProductCreateJson(raw: string): {
  product: ParsedProductCreateJson;
  warnings: string[];
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(unwrapJson(raw));
  } catch {
    throw new Error("El JSON no es válido.");
  }

  const data = asRecord(parsed, "El producto");
  const title = text(data.title);
  const fullDescription = text(data.fullDescription ?? data.description);
  if (!title) throw new Error("Falta el título.");
  if (!fullDescription) throw new Error("Falta la descripción.");

  const { categories, unknown } = categoriesFrom(data.categories);
  const warnings = unknown.map(
    (category) => `Se ignoró la categoría "${category}".`,
  );

  const quantityPrices = Array.isArray(data.quantityPrices)
    ? data.quantityPrices.flatMap((entry) => {
        const row = asRecord(entry, "Un precio por cantidad");
        const quantity = optionalNumber(row.quantity, "La cantidad");
        const price = positivePrice(row.price, "El precio por cantidad");
        if (!quantity || Number(quantity) <= 0 || !price) return [];
        return [{ quantity: String(Math.floor(Number(quantity))), price }];
      })
    : [];

  const variants = Array.isArray(data.variants)
    ? data.variants.flatMap((entry) => {
        const row = asRecord(entry, "Una variante");
        const description = text(row.description);
        const price = positivePrice(row.price, "El precio de la variante");
        if (!description || !price) return [];
        return [{ description, price }];
      })
    : [];

  const hidden =
    typeof data.hidden === "boolean"
      ? data.hidden
      : typeof data.isActive === "boolean"
        ? !data.isActive
        : false;

  return {
    warnings,
    product: {
      title,
      shortDescription: text(data.shortDescription),
      fullDescription,
      categories,
      topics: topicsText(data.topics),
      dimensions: text(data.dimensions),
      heightCm: optionalNumber(data.heightCm, "El alto"),
      widthCm: optionalNumber(data.widthCm, "El ancho"),
      depthCm: optionalNumber(data.depthCm, "La profundidad"),
      diameterCm: optionalNumber(data.diameterCm, "El diámetro"),
      finish: text(data.finish),
      customizable: data.customizable !== false,
      hidden,
      price: positivePrice(data.price, "El precio"),
      quantityPrices,
      variants,
      costQuote: parseCostQuote(data.costQuote),
    },
  };
}

function parseCostQuote(value: unknown): ParsedProductCreateJson["costQuote"] {
  if (value == null) return null;
  const quote = asRecord(value, "El cotizador");
  const woods = Array.isArray(quote.woods)
    ? quote.woods.map((entry) => {
        const row = asRecord(entry, "Una pieza de madera");
        const rawFace = text(row.face);
        const face: "" | WoodFaceType = isWoodFaceType(rawFace) ? rawFace : "";
        return {
          quantity: optionalNumber(row.quantity, "La cantidad de madera"),
          widthCm: optionalNumber(row.widthCm, "El ancho de la madera"),
          lengthCm: optionalNumber(row.lengthCm, "El largo de la madera"),
          face,
        };
      })
    : [];

  const accessories = Array.isArray(quote.accessories)
    ? quote.accessories.flatMap((entry) => {
        const row = asRecord(entry, "Un accesorio");
        const quantity = optionalNumber(row.quantity, "La cantidad del accesorio");
        const materialId = text(row.materialId);
        const materialName = text(row.materialName ?? row.name);
        if ((!materialId && !materialName) || !quantity || Number(quantity) <= 0) {
          return [];
        }
        return [{ materialId, materialName, quantity }];
      })
    : [];

  return {
    woods,
    machineMinutes: optionalNumber(quote.machineMinutes, "Los minutos de máquina"),
    machineHourlyRate:
      optionalNumber(quote.machineHourlyRate, "El valor hora de máquina") ||
      String(DEFAULT_MACHINE_HOURLY_RATE),
    laborMinutes: optionalNumber(quote.laborMinutes, "Los minutos de mano de obra"),
    laborHourlyRate:
      optionalNumber(quote.laborHourlyRate, "El valor hora de mano de obra") ||
      String(DEFAULT_LABOR_HOURLY_RATE),
    accessories,
    usesPaint: quote.usesPaint === true,
    paintAmount: optionalNumber(quote.paintAmount, "El monto de pintura"),
  };
}
