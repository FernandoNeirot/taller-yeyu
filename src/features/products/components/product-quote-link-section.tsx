"use client";

import Link from "next/link";
import { formatMoney } from "@/features/materials/lib/format";
import type { QuoteSummary } from "@/features/quotes/types";
import { FormSection, fieldClassName } from "./product-form-ui";

type ProductQuoteLinkSectionProps = {
  quotes: QuoteSummary[];
  value: string;
  onChange: (quoteId: string) => void;
  open: boolean;
  onToggle: () => void;
};

/** Sección opcional: vincula el producto con una cotización ya creada. */
export function ProductQuoteLinkSection({
  quotes,
  value,
  onChange,
  open,
  onToggle,
}: ProductQuoteLinkSectionProps) {
  const selected = quotes.find((quote) => quote.id === value);
  // Cotización borrada o que no llegó: se conserva el vínculo hasta que se cambie.
  const missing = Boolean(value) && !selected;
  const summary = selected
    ? `${selected.name} · ${formatMoney(selected.totalAmount)} c/u`
    : missing
      ? "Cotización no encontrada"
      : "Sin cotización";

  return (
    <FormSection
      id="product-section-quote"
      title="Cotización"
      summary={summary}
      open={open}
      onToggle={onToggle}
    >
      <div className="flex flex-col gap-xs">
        <label className="flex flex-col gap-xs">
          <span className="text-sm text-on-surface-variant">
            Cotización vinculada (opcional)
          </span>
          <select
            name="quoteId"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={fieldClassName}
          >
            <option value="">Sin cotización</option>
            {missing ? <option value={value}>(No encontrada)</option> : null}
            {quotes.map((quote) => (
              <option key={quote.id} value={quote.id}>
                {quote.name} · {formatMoney(quote.totalAmount)} c/u
              </option>
            ))}
          </select>
        </label>
        {selected ? (
          <p className="text-sm text-on-surface-variant">
            Costo por unidad {formatMoney(selected.totalAmount)}. Para{" "}
            {selected.units} unidades: {formatMoney(selected.batchCost)}.
          </p>
        ) : null}
        <p className="text-sm text-on-surface-variant">
          Las cotizaciones se arman en{" "}
          <Link href="/admin/cotizador" className="text-primary">
            Cotizador
          </Link>
          .
        </p>
      </div>
    </FormSection>
  );
}
