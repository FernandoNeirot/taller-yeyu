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
  /** `totalMaterialCost` + `totalTimeCost`. */
  totalAmount: number;
  createdBy: string;
};

export type QuoteInput = {
  name: string;
  date: string;
  items: QuoteItem[];
};
