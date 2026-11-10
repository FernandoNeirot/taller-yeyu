import { computePieceLayout } from "./piece-layout";
import type { Material } from "@/types/material";
import type { QuoteItem } from "@/types/product-pricing";

/** Lo que se carga en el formulario por cada línea (todo opcional salvo el material). */
export type QuoteItemInput = {
  materialId: string;
  /** Solo materiales de área. */
  widthCm?: number;
  heightCm?: number;
  /** Modo "una unidad": medidas de la pieza; se calcula cuántas entran por placa/hoja. */
  pieceWidthCm?: number;
  pieceHeightCm?: number;
  /** Unidades o minutos. En área se usa solo si no hay ancho y alto. */
  quantityUsed?: number;
  /** Cuántas unidades entran en lo cargado; el consumo por unidad es lo cargado ÷ esto. */
  fitsCount?: number;
};

function positive(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

/** Cuántas unidades entran; solo aplica a área y unidad, y mínimo 1. */
function effectiveFits(
  material: Pick<Material, "measureType">,
  input: Omit<QuoteItemInput, "materialId">,
) {
  if (material.measureType === "time_minutes") return 1;
  return Math.max(positive(input.fitsCount), 1);
}

/**
 * Área: ancho × alto (cm²). Unidad y tiempo: la cantidad cargada.
 * Si entran N unidades en lo cargado, devuelve lo que consume una sola.
 */
export function computeQuantityUsed(
  material: Pick<Material, "measureType"> &
    Partial<Pick<Material, "category" | "workArea">>,
  input: Omit<QuoteItemInput, "materialId">,
) {
  if (
    material.measureType === "area_cm2" &&
    (input.pieceWidthCm || input.pieceHeightCm)
  ) {
    // Cada unidad consume la placa dividida las que entran: la pérdida (márgenes y
    // sobrante) queda repartida entre todas las unidades.
    const layout = computePieceLayout(
      {
        category: material.category,
        measureType: material.measureType,
        workArea: material.workArea,
      },
      input.pieceWidthCm,
      input.pieceHeightCm,
    );
    return layout ? layout.sheetAreaCm2 / layout.perSheet : 0;
  }
  const fits = effectiveFits(material, input);
  if (material.measureType === "area_cm2") {
    const widthCm = positive(input.widthCm);
    const heightCm = positive(input.heightCm);
    if (widthCm && heightCm) return (widthCm * heightCm) / fits;
  }
  return positive(input.quantityUsed) / fits;
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
    const pieceWidthCm = positive(input.pieceWidthCm);
    const pieceHeightCm = positive(input.pieceHeightCm);
    const widthCm = positive(input.widthCm);
    const heightCm = positive(input.heightCm);
    if (pieceWidthCm && pieceHeightCm) {
      item.pieceWidthCm = pieceWidthCm;
      item.pieceHeightCm = pieceHeightCm;
    } else if (widthCm && heightCm) {
      item.widthCm = widthCm;
      item.heightCm = heightCm;
    }
  }

  const fits = effectiveFits(material, input);
  if (fits > 1 && !item.pieceWidthCm) item.fitsCount = fits;

  return item;
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
        pieceWidthCm: positive(data.pieceWidthCm) || undefined,
        pieceHeightCm: positive(data.pieceHeightCm) || undefined,
        quantityUsed: positive(data.quantityUsed) || undefined,
        fitsCount: positive(data.fitsCount) || undefined,
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
