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
  /** Modo "una unidad": medidas de la pieza; `quantityUsed` sale de cuántas entran por placa. */
  pieceWidthCm?: number;
  pieceHeightCm?: number;
  /**
   * Cuántas unidades entran en las medidas/cantidad cargadas: `quantityUsed`
   * ya es lo que consume una sola unidad (medidas ÷ `fitsCount`).
   */
  fitsCount?: number;
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
