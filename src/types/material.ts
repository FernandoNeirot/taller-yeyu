export const measureTypes = ["area_cm2", "unit", "time_minutes"] as const;
export type MeasureType = (typeof measureTypes)[number];

export const measureTypeLabels: Record<MeasureType, string> = {
  area_cm2: "Superficie (cm²)",
  unit: "Unidad",
  time_minutes: "Tiempo (minutos)",
};

/** Unidad corta para mostrar junto a cantidades y costos por unidad. */
export const measureUnitLabels: Record<MeasureType, string> = {
  area_cm2: "cm²",
  unit: "u.",
  time_minutes: "min",
};

export function isMeasureType(value: unknown): value is MeasureType {
  return (
    typeof value === "string" && (measureTypes as readonly string[]).includes(value)
  );
}

export const materialCategories = ["wood", "paper", "other"] as const;
export type MaterialCategory = (typeof materialCategories)[number];

export const materialCategoryLabels: Record<MaterialCategory, string> = {
  wood: "Madera",
  paper: "Papel",
  other: "Otro",
};

export function isMaterialCategory(value: unknown): value is MaterialCategory {
  return (
    typeof value === "string" &&
    (materialCategories as readonly string[]).includes(value)
  );
}

/** Pieza base con la que se compra/corta cada categoría (medidas en cm). */
export const materialSheetBases: Partial<
  Record<MaterialCategory, { label: string; unit: string; widthCm: number; heightCm: number }>
> = {
  wood: { label: "Placa 30×30", unit: "placa", widthCm: 30, heightCm: 30 },
  paper: { label: "Hoja 21×30", unit: "hoja", widthCm: 21, heightCm: 30 },
};

export interface Material {
  id: string;
  name: string;
  measureType: MeasureType;
  /** Madera, papel u otro. Define la placa/hoja base del cotizador. */
  category?: MaterialCategory;
  /** Lo que se pagó por el pack/plancha. */
  totalCost: number;
  /** Cantidad total que rinde ese pago (ej: 100 hojas de 21x30 = 63000 cm²). */
  totalUnits: number;
  /** Calculado: totalCost / totalUnits. */
  costPerUnit: number;
}

export function computeCostPerUnit(totalCost: number, totalUnits: number) {
  if (!(totalUnits > 0) || !(totalCost >= 0)) return 0;
  return totalCost / totalUnits;
}
