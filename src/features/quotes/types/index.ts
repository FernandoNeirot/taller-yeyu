import type { QuoteItem } from "@/types/product-pricing";

export type { QuoteItem };

export type Quote = {
  id: string;
  name: string;
  date: string;
  items: QuoteItem[];
  /** Gasto en materiales físicos (área y unidad). */
  totalMaterialCost: number;
  /** Costo de tiempo (máquina, mano de obra). */
  totalTimeCost: number;
  /** Costo por unidad: `totalMaterialCost` + `totalTimeCost`. */
  totalAmount: number;
  /** Cuántas unidades se planea producir. */
  units: number;
  /** Costo de producir `units` unidades (placas/hojas enteras, con el sobrante). */
  batchCost: number;
  createdBy: string;
  /** Última edición (ISO). Puede faltar en cotizaciones viejas. */
  updatedAt?: string;
};

export type QuoteInput = {
  name: string;
  date: string;
  items: QuoteItem[];
  units: number;
  batchCost: number;
};

/** Lo mínimo de una cotización para vincularla desde un producto. */
export type QuoteSummary = Pick<
  Quote,
  "id" | "name" | "totalAmount" | "units" | "batchCost"
>;
