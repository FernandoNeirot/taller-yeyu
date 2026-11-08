import { materialSheetBases, type Material } from "@/types/material";

export type SheetUsage = {
  label: string;
  unit: string;
  sheetAreaCm2: number;
  /** Lo que cuesta una placa/hoja entera de este material. */
  costPerSheet: number;
  /** Fracción de placa/hoja que consume una unidad de producto. */
  sheetsPerProduct: number;
  /** Placas/hojas (con decimales) para `products` productos. */
  sheetsNeeded: number;
  /** Placas/hojas enteras a comprar/cortar para `products` productos. */
  sheetsToBuy: number;
};

/**
 * Para materiales de área con base conocida (madera 30×30, papel 21×30)
 * convierte el consumo por producto en placas/hojas. Devuelve null si no aplica.
 */
export function computeSheetUsage(
  material: Pick<Material, "category" | "measureType" | "costPerUnit">,
  quantityUsed: number,
  products: number,
): SheetUsage | null {
  if (material.measureType !== "area_cm2" || !material.category) return null;
  const base = materialSheetBases[material.category];
  if (!base) return null;

  const sheetAreaCm2 = base.widthCm * base.heightCm;
  const sheetsPerProduct = quantityUsed / sheetAreaCm2;
  const sheetsNeeded = sheetsPerProduct * Math.max(products, 1);

  return {
    label: base.label,
    unit: base.unit,
    sheetAreaCm2,
    costPerSheet: Math.round(sheetAreaCm2 * material.costPerUnit * 100) / 100,
    sheetsPerProduct,
    sheetsNeeded,
    // El redondeo tolera ruido de punto flotante (ej: 3.0000000001 → 3).
    sheetsToBuy: Math.ceil(Math.round(sheetsNeeded * 1e6) / 1e6),
  };
}
