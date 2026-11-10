import type { Material } from "@/types/material";
import type { QuoteItem } from "@/types/product-pricing";
import { computeSheetUsage } from "./sheet-usage";

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

/** Cantidad de unidades válida: entero mínimo 1. */
export function normalizeUnits(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(Math.floor(parsed), 1) : 1;
}

/**
 * Costo de una línea para `units` unidades. Madera y papel se compran por
 * placa/hoja entera (se redondea hacia arriba y el sobrante es material perdido);
 * el resto se prorratea.
 */
export function computeBatchItemCost(
  material: Pick<Material, "category" | "measureType" | "costPerUnit"> | undefined,
  item: Pick<QuoteItem, "quantityUsed" | "calculatedCost">,
  units: number,
) {
  const sheets = material
    ? computeSheetUsage(material, item.quantityUsed, units)
    : null;
  return sheets ? sheets.batchCost : roundMoney(item.calculatedCost * units);
}

/** Costo total de producir `units` unidades con los materiales vigentes. */
export function computeBatchTotal(
  items: QuoteItem[],
  materials: Material[],
  units: number,
) {
  const byId = new Map(materials.map((material) => [material.id, material]));
  return roundMoney(
    items.reduce(
      (sum, item) =>
        sum + computeBatchItemCost(byId.get(item.materialId), item, units),
      0,
    ),
  );
}
