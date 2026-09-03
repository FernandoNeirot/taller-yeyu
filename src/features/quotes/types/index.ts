import {
  materialSubcategoryLabels,
  type AccessoryMeasureType,
  type MaterialRecord,
  type MaterialSubcategory,
} from "@/features/finance/types";

export type QuoteItemType = MaterialSubcategory;

export type MaterialCatalogItem = {
  id: string;
  type: QuoteItemType;
  name: string;
  pricePerCm2?: number;
  widthCm?: number;
  lengthCm?: number;
  pricePerGram?: number;
  unitPrice?: number;
  measureType?: AccessoryMeasureType;
};

export type QuoteItem = {
  id: string;
  type: QuoteItemType;
  materialId: string;
  materialName: string;
  widthCm?: number;
  lengthCm?: number;
  quantity: number;
  grams?: number;
  areaCm2?: number;
  pricePerCm2?: number;
  pricePerGram?: number;
  unitPrice?: number;
  measureType?: AccessoryMeasureType;
  amount: number;
};

export type Quote = {
  id: string;
  name: string;
  date: string;
  items: QuoteItem[];
  totalAmount: number;
  createdBy: string;
};

export type QuoteInput = {
  name: string;
  date: string;
  items: QuoteItem[];
};

export const quoteTypeLabels = materialSubcategoryLabels;

export function woodAreaCm2(widthCm: number, lengthCm: number) {
  return Math.max(widthCm, 0) * Math.max(lengthCm, 0);
}

export function quoteQuantity(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 1;
}

export function isQuoteItemType(value: unknown): value is QuoteItemType {
  return value === "maderas" || value === "pinturas" || value === "accesorios";
}

export function computeQuoteItemAmount(item: {
  type: QuoteItemType;
  widthCm?: number;
  lengthCm?: number;
  quantity?: number;
  grams?: number;
  pricePerCm2?: number;
  pricePerGram?: number;
  unitPrice?: number;
}) {
  if (item.type === "maderas") {
    return (
      woodAreaCm2(item.widthCm ?? 0, item.lengthCm ?? 0) *
      (item.pricePerCm2 ?? 0) *
      quoteQuantity(item.quantity ?? 1)
    );
  }

  if (item.type === "pinturas") {
    return Math.max(item.grams ?? 0, 0) * (item.pricePerGram ?? 0);
  }

  return quoteQuantity(item.quantity ?? 1) * (item.unitPrice ?? 0);
}

function catalogKey(material: MaterialRecord) {
  const name = material.name.trim().toLowerCase();
  if (material.type === "pinturas" && material.color) {
    return `${material.type}:${name}:${material.color.trim().toLowerCase()}`;
  }
  return `${material.type}:${name}`;
}

function hasQuotePrice(material: MaterialRecord) {
  if (material.type === "maderas") return (material.pricePerCm2 ?? 0) > 0;
  if (material.type === "pinturas") return (material.pricePerGram ?? 0) > 0;
  return (material.unitPrice ?? 0) > 0;
}

export function buildMaterialCatalog(
  materials: MaterialRecord[],
): MaterialCatalogItem[] {
  const latestByKey = new Map<string, MaterialRecord>();

  for (const material of materials) {
    if (!material.name.trim() || !hasQuotePrice(material)) continue;
    const key = catalogKey(material);
    const existing = latestByKey.get(key);
    if (!existing || material.date > existing.date) {
      latestByKey.set(key, material);
    }
  }

  return [...latestByKey.values()]
    .map((material) => ({
      id: material.id,
      type: material.type,
      name: material.name,
      pricePerCm2: material.pricePerCm2,
      widthCm: material.widthCm,
      lengthCm: material.lengthCm,
      pricePerGram: material.pricePerGram,
      unitPrice: material.unitPrice,
      measureType: material.measureType,
    }))
    .sort((a, b) => {
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type, "es");
      }
      return a.name.localeCompare(b.name, "es");
    });
}

export function catalogByType(
  catalog: MaterialCatalogItem[],
  type: QuoteItemType,
) {
  return catalog.filter((item) => item.type === type);
}
