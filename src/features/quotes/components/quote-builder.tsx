"use client";

import { useActionState, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { QuoteItemsEditor } from "@/features/materials/components/quote-items-editor";
import { formatMoney } from "@/features/materials/lib/format";
import {
  emptyQuoteRow,
  itemsToRows,
  rowsToPayload,
  type QuoteItemRow,
} from "@/features/materials/lib/quote-rows";
import type { Material } from "@/types/material";
import { saveQuoteAction } from "../actions/save-quote";
import type { Quote } from "../types";

function getTodayDate() {
  return new Date().toLocaleDateString("en-CA");
}

function formatTableDate(date: string) {
  const [, month, day] = date.split("-");
  if (!day || !month) return date;
  return `${day}-${month}`;
}

function quoteToRows(quote: Quote): QuoteItemRow[] {
  return quote.items.length === 0 ? [emptyQuoteRow()] : itemsToRows(quote.items);
}

export function QuoteBuilder({
  materials,
  quotes: initialQuotes,
}: {
  materials: Material[];
  quotes: Quote[];
}) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(getTodayDate);
  const [rows, setRows] = useState<QuoteItemRow[]>(() => [emptyQuoteRow()]);
  const [quotes, setQuotes] = useState(initialQuotes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [state, action, pending] = useActionState(saveQuoteAction, null);

  // Líneas de cotizaciones viejas cuyo material ya no está en el catálogo.
  const orphanRows = rows.filter(
    (row) => row.materialId && !materials.some((item) => item.id === row.materialId),
  ).length;

  // Cuando el servidor devuelve la cotización guardada se actualiza la lista y se limpia el formulario.
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    const saved = state?.quote;
    if (saved) {
      setQuotes((prev) => {
        const exists = prev.some((quote) => quote.id === saved.id);
        if (exists) {
          return prev.map((quote) => (quote.id === saved.id ? saved : quote));
        }
        return [saved, ...prev];
      });
      resetForm();
    }
  }

  function resetForm() {
    setName("");
    setDate(getTodayDate());
    setRows([emptyQuoteRow()]);
    setEditingId(null);
  }

  function startEdit(quote: Quote) {
    setEditingId(quote.id);
    setName(quote.name);
    setDate(quote.date || getTodayDate());
    setRows(quoteToRows(quote));
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-lg">
      <article className="rounded-2xl border border-outline-variant/20 bg-surface-container p-lg">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">
          {editingId ? "Editar cotización" : "Nueva cotización"}
        </h2>
        <p className="text-sm text-on-surface-variant mb-md">
          Sumá materiales del catálogo. El costo se calcula según superficie,
          unidades o minutos.
        </p>

        <form action={action} className="flex flex-col gap-sm">
          {state?.error ? (
            <div className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
              {state.error}
            </div>
          ) : null}

          {editingId ? <input type="hidden" name="id" value={editingId} /> : null}
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="items" value={JSON.stringify(rowsToPayload(rows))} />

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">Nombre</span>
            <input
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej: Velador de mesa Juan"
              required
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
            />
          </label>

          {orphanRows > 0 ? (
            <div className="rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
              {orphanRows === 1
                ? "Un material de esta cotización ya no está en el catálogo."
                : `${orphanRows} materiales de esta cotización ya no están en el catálogo.`}{" "}
              Elegí el material de nuevo para recalcular.
            </div>
          ) : null}

          <QuoteItemsEditor rows={rows} materials={materials} onChange={setRows} />

          <div className="flex gap-sm mt-sm">
            <button
              type="submit"
              disabled={pending || materials.length === 0}
              className="flex-1 rounded-lg bg-primary-container px-6 py-3 text-white font-label-caps text-label-caps tracking-widest uppercase hover:bg-secondary-container transition-colors disabled:opacity-50"
            >
              {pending
                ? "Guardando..."
                : editingId
                  ? "Guardar cambios"
                  : "Guardar cotización"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-outline-variant/40 px-4 py-3 text-on-surface-variant font-label-caps text-label-caps tracking-widest uppercase hover:bg-surface-container-high transition-colors"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      </article>

      <article className="rounded-2xl border border-outline-variant/20 bg-surface-container p-lg">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
          Cotizaciones
        </h3>

        {quotes.length === 0 ? (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-lg text-center text-on-surface-variant">
            Todavía no hay cotizaciones guardadas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-on-surface-variant border-b border-outline-variant/30">
                  <th className="py-2 pr-2">Fecha</th>
                  <th className="py-2 pr-2">Nombre</th>
                  <th className="py-2 pr-2">Materiales</th>
                  <th className="py-2 pr-2">Tiempo</th>
                  <th className="py-2 pr-2">Total</th>
                  <th className="py-2"> </th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr
                    key={quote.id}
                    className={
                      quote.id === editingId
                        ? "border-b border-outline-variant/10 bg-primary/10"
                        : "border-b border-outline-variant/10"
                    }
                  >
                    <td className="py-2 pr-2">{formatTableDate(quote.date)}</td>
                    <td className="py-2 pr-2">{quote.name}</td>
                    <td className="py-2 pr-2 whitespace-nowrap">
                      {formatMoney(quote.totalMaterialCost)}
                    </td>
                    <td className="py-2 pr-2 whitespace-nowrap">
                      {formatMoney(quote.totalTimeCost)}
                    </td>
                    <td className="py-2 pr-2 whitespace-nowrap font-semibold">
                      {formatMoney(quote.totalAmount)}
                    </td>
                    <td className="py-2 w-10">
                      <button
                        type="button"
                        onClick={() => startEdit(quote)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-primary hover:bg-primary/10 transition-colors"
                        aria-label="Editar cotización"
                        title="Editar"
                      >
                        <MaterialIcon name="edit" className="text-base" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}
