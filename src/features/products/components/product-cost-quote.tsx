"use client";

import { QuoteItemsEditor } from "@/features/materials/components/quote-items-editor";
import { sumQuoteItems, sumQuoteMinutes } from "@/features/materials/lib/quote-items";
import {
  itemsToRows,
  rowsToItems,
  rowsToPayload,
  type QuoteItemRow,
} from "@/features/materials/lib/quote-rows";
import type { Material } from "@/types/material";
import type { ProductCostQuote } from "@/types/product-pricing";

export type CostQuoteFormState = {
  rows: QuoteItemRow[];
};

export const emptyCostQuoteForm: CostQuoteFormState = { rows: [] };

export function costQuoteToForm(quote?: ProductCostQuote): CostQuoteFormState {
  // `items` puede faltar si el producto viene de la caché con el formato anterior.
  if (!quote?.items?.length) return emptyCostQuoteForm;
  return { rows: itemsToRows(quote.items) };
}

/** Total del cotizador con los materiales vigentes (suma de los `calculatedCost`). */
export function costQuoteFormTotal(value: CostQuoteFormState, materials: Material[]) {
  return sumQuoteItems(rowsToItems(value.rows, materials));
}

export function costQuoteMinutes(value: CostQuoteFormState, materials: Material[]) {
  return sumQuoteMinutes(rowsToItems(value.rows, materials));
}

type ProductCostQuoteFieldsProps = {
  value: CostQuoteFormState;
  onChange: (next: CostQuoteFormState) => void;
  materials: Material[];
};

export function ProductCostQuoteFields({
  value,
  onChange,
  materials,
}: ProductCostQuoteFieldsProps) {
  return (
    <div className="flex flex-col gap-sm">
      {/* El servidor recalcula nombres, cantidades y costos con el catálogo vigente. */}
      <input
        type="hidden"
        name="costQuote"
        value={JSON.stringify(rowsToPayload(value.rows))}
      />
      <QuoteItemsEditor
        rows={value.rows}
        materials={materials}
        onChange={(rows) => onChange({ rows })}
      />
    </div>
  );
}
