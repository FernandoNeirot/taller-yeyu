import type { MeasureType } from "./material";

/**
 * Una línea del cotizador de un producto: un material y cuánto se usa.
 * `quantityUsed` está en la unidad del material: cm² (área), unidades o minutos.
 */
export type QuoteItem = {
  materialId: string;
  name: string;
  measureType: MeasureType;
  quantityUsed: number;
  calculatedCost: number;
  /** Solo en materiales de área: medidas con las que se calculó `quantityUsed`. */
  widthCm?: number;
  heightCm?: number;
};

export type ProductCostQuote = {
  items: QuoteItem[];
  /** Gasto de bolsillo: suma de los materiales de área y de unidad. */
  totalMaterialCost: number;
  /** Retribución: suma de los materiales de tiempo (máquina, mano de obra). */
  totalTimeCost: number;
  /** `totalMaterialCost` + `totalTimeCost`. */
  totalAmount: number;
};

export type ProductQuantityPrice = {
  quantity: number;
  price: number;
};

/** Formato de venta mayorista: `price` es el precio final del pack completo. */
export type ProductPackOption = {
  quantity: number;
  price: number;
};

export type ProductVariant = {
  description: string;
  price: number;
};
