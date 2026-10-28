import type { Material } from "@/types/material";
import type { ProductCostQuote, QuoteItem } from "@/types/product-pricing";

/** Lo que se carga en el formulario por cada línea (todo opcional salvo el material). */
export type QuoteItemInput = {
  materialId: string;
  /** Solo materiales de área. */
  widthCm?: number;
  heightCm?: number;
  /** Unidades o minutos. En área se usa solo si no hay ancho y alto. */
  quantityUsed?: number;
};

function positive(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

/** Área: ancho × alto (cm²). Unidad y tiempo: la cantidad cargada. */
export function computeQuantityUsed(
  material: Pick<Material, "measureType">,
  input: Omit<QuoteItemInput, "materialId">,
) {
  if (material.measureType === "area_cm2") {
    const widthCm = positive(input.widthCm);
    const heightCm = positive(input.heightCm);
    if (widthCm && heightCm) return widthCm * heightCm;
  }
  return positive(input.quantityUsed);
}

export function computeCalculatedCost(
  material: Pick<Material, "costPerUnit">,
  quantityUsed: number,
) {
  return roundMoney(positive(quantityUsed) * material.costPerUnit);
}

/** Arma la línea guardada; devuelve null si no se usa nada del material. */
export function buildQuoteItem(
  material: Material,
  input: Omit<QuoteItemInput, "materialId">,
): QuoteItem | null {
  const quantityUsed = computeQuantityUsed(material, input);
  if (quantityUsed <= 0) return null;

  const item: QuoteItem = {
    materialId: material.id,
    name: material.name,
    measureType: material.measureType,
    quantityUsed,
    calculatedCost: computeCalculatedCost(material, quantityUsed),
  };

  if (material.measureType === "area_cm2") {
    const widthCm = positive(input.widthCm);
    const heightCm = positive(input.heightCm);
    if (widthCm && heightCm) {
      item.widthCm = widthCm;
      item.heightCm = heightCm;
    }
  }

  return item;
}

export function sumQuoteItems(items: Pick<QuoteItem, "calculatedCost">[]) {
  return roundMoney(
    items.reduce((sum, item) => sum + (item.calculatedCost ?? 0), 0),
  );
}

export type QuoteTotals = {
  totalMaterialCost: number;
  totalTimeCost: number;
  totalAmount: number;
};

/**
 * Separa el costo en gasto de materiales físicos (área y unidad) y costo de
 * tiempo (`time_minutes`: máquina o mano de obra). El total es la suma de ambos.
 */
export function splitQuoteTotals(
  items: Pick<QuoteItem, "measureType" | "calculatedCost">[],
): QuoteTotals {
  let totalMaterialCost = 0;
  let totalTimeCost = 0;

  for (const item of items) {
    if (item.measureType === "time_minutes") totalTimeCost += item.calculatedCost ?? 0;
    else totalMaterialCost += item.calculatedCost ?? 0;
  }

  totalMaterialCost = roundMoney(totalMaterialCost);
  totalTimeCost = roundMoney(totalTimeCost);
  return {
    totalMaterialCost,
    totalTimeCost,
    totalAmount: roundMoney(totalMaterialCost + totalTimeCost),
  };
}

/** Minutos de máquina/trabajo del cotizador (para mostrar el tiempo estimado). */
export function sumQuoteMinutes(items: QuoteItem[]) {
  return items
    .filter((item) => item.measureType === "time_minutes")
    .reduce((sum, item) => sum + item.quantityUsed, 0);
}

/** Lee el JSON que manda el formulario; descarta lo que no tenga forma de línea. */
export function parseQuoteItemInputs(raw: unknown): QuoteItemInput[] {
  if (typeof raw !== "string" || !raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((entry): QuoteItemInput[] => {
    if (!entry || typeof entry !== "object") return [];
    const data = entry as Record<string, unknown>;
    const materialId = String(data.materialId ?? "").trim();
    if (!materialId) return [];
    return [
      {
        materialId,
        widthCm: positive(data.widthCm) || undefined,
        heightCm: positive(data.heightCm) || undefined,
        quantityUsed: positive(data.quantityUsed) || undefined,
      },
    ];
  });
}

/**
 * Recalcula todo contra el catálogo vigente: nombre, tipo, cantidad usada y
 * costo salen del material, nunca de lo que mande el cliente.
 */
export function finalizeQuoteItems(
  inputs: QuoteItemInput[],
  materials: Material[],
): QuoteItem[] {
  const byId = new Map(materials.map((material) => [material.id, material]));

  return inputs.flatMap((input) => {
    const material = byId.get(input.materialId);
    if (!material) return [];
    const item = buildQuoteItem(material, input);
    return item ? [item] : [];
  });
}

export function finalizeCostQuote(
  inputs: QuoteItemInput[],
  materials: Material[],
): ProductCostQuote | undefined {
  const items = finalizeQuoteItems(inputs, materials);
  if (items.length === 0) return undefined;
  return { items, ...splitQuoteTotals(items) };
}

/** Lee un costQuote guardado. Los guardados con el formato anterior (sin `items`) se descartan. */
export function mapStoredCostQuote(value: unknown): ProductCostQuote | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = (value as { items?: unknown }).items;
  if (!Array.isArray(raw)) return undefined;

  const items = raw.flatMap((entry): QuoteItem[] => {
    if (!entry || typeof entry !== "object") return [];
    const data = entry as Record<string, unknown>;
    const materialId = String(data.materialId ?? "").trim();
    const measureType = data.measureType;
    if (
      !materialId ||
      (measureType !== "area_cm2" &&
        measureType !== "unit" &&
        measureType !== "time_minutes")
    ) {
      return [];
    }
    const quantityUsed = positive(data.quantityUsed);
    if (!quantityUsed) return [];

    const item: QuoteItem = {
      materialId,
      name: String(data.name ?? materialId),
      measureType,
      quantityUsed,
      calculatedCost: positive(data.calculatedCost),
    };
    const widthCm = positive(data.widthCm);
    const heightCm = positive(data.heightCm);
    if (measureType === "area_cm2" && widthCm && heightCm) {
      item.widthCm = widthCm;
      item.heightCm = heightCm;
    }
    return [item];
  });

  if (items.length === 0) return undefined;
  return { items, ...splitQuoteTotals(items) };
}
