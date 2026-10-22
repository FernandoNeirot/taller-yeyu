"use client";

import type { MaterialCatalogItem } from "@/features/quotes/types";
import { formatProductPrice } from "../lib/format-price";
import {
  ProductCostQuoteFields,
  type CostQuoteFormState,
} from "./product-cost-quote";
import { FormSection } from "./product-form-ui";

type ProductCostSectionProps = {
  value: CostQuoteFormState;
  onChange: (value: CostQuoteFormState) => void;
  materials: MaterialCatalogItem[];
  total: number;
  minutes: number;
  open: boolean;
  onToggle: () => void;
};

/** Sección "Cotizador" del formulario: costo estimado de producción. */
export function ProductCostSection({
  value,
  onChange,
  materials,
  total,
  minutes,
  open,
  onToggle,
}: ProductCostSectionProps) {
  const summary =
    [
      total > 0 ? formatProductPrice(total) : null,
      minutes > 0 ? `${minutes} min` : null,
    ]
      .filter(Boolean)
      .join(" · ") || "Sin costo";

  return (
    <FormSection
      id="product-section-quote"
      title="Cotizador"
      summary={summary}
      open={open}
      onToggle={onToggle}
    >
      <ProductCostQuoteFields
        value={value}
        onChange={onChange}
        materials={materials}
      />
    </FormSection>
  );
}
