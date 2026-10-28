import type { Material } from "@/types/material";
import type { QuoteItem } from "@/types/product-pricing";
import {
  finalizeQuoteItems,
  type QuoteItemInput,
} from "./quote-items";

/** Estado de una línea en los formularios (todo como texto, tal como se escribe). */
export type QuoteItemRow = {
  id: string;
  materialId: string;
  widthCm: string;
  heightCm: string;
  /** Unidades o minutos. */
  quantity: string;
};

export function emptyQuoteRow(): QuoteItemRow {
  return {
    id: crypto.randomUUID(),
    materialId: "",
    widthCm: "",
    heightCm: "",
    quantity: "",
  };
}

export function rowToInput(row: QuoteItemRow): QuoteItemInput {
  return {
    materialId: row.materialId,
    widthCm: Number(row.widthCm) || undefined,
    heightCm: Number(row.heightCm) || undefined,
    quantityUsed: Number(row.quantity) || undefined,
  };
}

export function itemsToRows(items: QuoteItem[] | undefined): QuoteItemRow[] {
  return (items ?? []).map((item) => ({
    id: crypto.randomUUID(),
    materialId: item.materialId,
    widthCm: item.widthCm ? String(item.widthCm) : "",
    heightCm: item.heightCm ? String(item.heightCm) : "",
    // En área sin medidas guardadas (importación) la cantidad ya es el área.
    quantity:
      item.measureType === "area_cm2" && item.widthCm && item.heightCm
        ? ""
        : String(item.quantityUsed),
  }));
}

export function rowsToItems(rows: QuoteItemRow[], materials: Material[]) {
  return finalizeQuoteItems(rows.map(rowToInput), materials);
}

/** Lo que viaja al servidor: solo lo cargado; el costo se recalcula allá. */
export function rowsToPayload(rows: QuoteItemRow[]): QuoteItemInput[] {
  return rows.map(rowToInput).filter((input) => input.materialId);
}
