"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import {
  materialSubcategories,
  type MaterialRecord,
} from "@/features/finance/types";
import { saveQuoteAction } from "../actions/save-quote";
import {
  buildMaterialCatalog,
  catalogByType,
  computeQuoteItemAmount,
  quoteQuantity,
  quoteTypeLabels,
  woodAreaCm2,
  type MaterialCatalogItem,
  type Quote,
  type QuoteItemType,
} from "../types";

type ItemRow = {
  id: string;
  type: QuoteItemType | "";
  materialId: string;
  materialName: string;
  widthCm: string;
  lengthCm: string;
  quantity: string;
  grams: string;
};

function getTodayDate() {
  return new Date().toLocaleDateString("en-CA");
}

function formatTableDate(date: string) {
  const [, month, day] = date.split("-");
  if (!day || !month) return date;
  return `${day}-${month}`;
}

function formatMoney(value: number) {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });
}

function emptyRow(): ItemRow {
  return {
    id: crypto.randomUUID(),
    type: "",
    materialId: "",
    materialName: "",
    widthCm: "",
    lengthCm: "",
    quantity: "1",
    grams: "",
  };
}

function catalogMaterial(row: ItemRow, catalog: MaterialCatalogItem[]) {
  return (
    catalog.find((item) => item.id === row.materialId) ??
    catalog.find(
      (item) => item.name.toLowerCase() === row.materialName.toLowerCase(),
    )
  );
}

function quoteToRows(quote: Quote, catalog: MaterialCatalogItem[]): ItemRow[] {
  if (quote.items.length === 0) return [emptyRow()];
  return quote.items.map((item) => {
    const material =
      catalog.find((option) => option.id === item.materialId) ??
      catalog.find(
        (option) =>
          option.type === item.type &&
          option.name.toLowerCase() === item.materialName.toLowerCase(),
      );

    return {
      id: item.id,
      type: material?.type ?? item.type,
      materialId: material?.id ?? item.materialId,
      materialName: material?.name ?? item.materialName,
      widthCm: item.widthCm ? String(item.widthCm) : "",
      lengthCm: item.lengthCm ? String(item.lengthCm) : "",
      quantity: String(quoteQuantity(item.quantity)),
      grams: item.grams ? String(item.grams) : "",
    };
  });
}

function rowTotals(row: ItemRow, catalog: MaterialCatalogItem[]) {
  const material = catalogMaterial(row, catalog);
  const type = material?.type ?? row.type;
  const widthCm = Number(row.widthCm) || 0;
  const lengthCm = Number(row.lengthCm) || 0;
  const quantity = quoteQuantity(Number(row.quantity));
  const grams = Number(row.grams) || 0;
  const amount = type
    ? computeQuoteItemAmount({
        type,
        widthCm,
        lengthCm,
        quantity,
        grams,
        pricePerCm2: material?.pricePerCm2,
        pricePerGram: material?.pricePerGram,
        unitPrice: material?.unitPrice,
      })
    : 0;

  return {
    material,
    type,
    widthCm,
    lengthCm,
    quantity,
    grams,
    areaCm2: woodAreaCm2(widthCm, lengthCm),
    amount,
  };
}

export function QuoteBuilder({
  materials,
  quotes: initialQuotes,
}: {
  materials: MaterialRecord[];
  quotes: Quote[];
}) {
  const catalog = buildMaterialCatalog(materials);
  const [name, setName] = useState("");
  const [date, setDate] = useState(getTodayDate);
  const [rows, setRows] = useState<ItemRow[]>([emptyRow()]);
  const [quotes, setQuotes] = useState(initialQuotes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [state, action, pending] = useActionState(saveQuoteAction, null);

  const totalAmount = rows.reduce(
    (acc, row) => acc + rowTotals(row, catalog).amount,
    0,
  );

  useEffect(() => {
    const saved = state?.quote;
    if (!saved) return;

    setQuotes((prev) => {
      const exists = prev.some((quote) => quote.id === saved.id);
      if (exists) {
        return prev.map((quote) => (quote.id === saved.id ? saved : quote));
      }
      return [saved, ...prev];
    });
    resetForm();
  }, [state]);

  function resetForm() {
    setName("");
    setDate(getTodayDate());
    setRows([emptyRow()]);
    setEditingId(null);
  }

  function startEdit(quote: Quote) {
    setEditingId(quote.id);
    setName(quote.name);
    setDate(quote.date || getTodayDate());
    setRows(quoteToRows(quote, catalog));
  }

  function updateRow(id: string, patch: Partial<ItemRow>) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  function selectType(id: string, type: QuoteItemType | "") {
    updateRow(id, {
      type,
      materialId: "",
      materialName: "",
      widthCm: "",
      lengthCm: "",
      quantity: "1",
      grams: "",
    });
  }

  function selectMaterial(id: string, materialId: string) {
    const material = catalog.find((item) => item.id === materialId);
    updateRow(id, {
      materialId,
      type: material?.type ?? "",
      materialName: material?.name ?? "",
    });
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-lg">
      <article className="rounded-2xl border border-outline-variant/20 bg-surface-container p-lg">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">
          {editingId ? "Editar cotización" : "Nueva cotización"}
        </h2>
        <p className="text-sm text-on-surface-variant mb-md">
          Sumá maderas, pinturas y accesorios del catálogo. El costo se calcula
          según superficie, gramos o unidad.
        </p>

        <form action={action} className="flex flex-col gap-sm">
          {state?.error ? (
            <div className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
              {state.error}
            </div>
          ) : null}

          {editingId ? <input type="hidden" name="id" value={editingId} /> : null}
          <input type="hidden" name="date" value={date} />
          <input
            type="hidden"
            name="items"
            value={JSON.stringify(
              rows.map((row) => {
                const totals = rowTotals(row, catalog);
                return {
                  id: row.id,
                  type: totals.type,
                  materialId: row.materialId,
                  materialName: totals.material?.name || row.materialName,
                  widthCm: totals.widthCm,
                  lengthCm: totals.lengthCm,
                  quantity: totals.quantity,
                  grams: totals.grams,
                };
              }),
            )}
          />

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

          {catalog.length === 0 ? (
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-md text-sm text-on-surface-variant">
              Todavía no hay materiales en el catálogo. Cargalos en{" "}
              <Link href="/admin/financiero" className="text-primary">
                Control Financiero → Emprendimiento
              </Link>
              .
            </div>
          ) : (
            <div className="flex flex-col gap-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">Materiales</p>
                <button
                  type="button"
                  onClick={() => setRows((prev) => [...prev, emptyRow()])}
                  className="text-sm text-primary"
                >
                  + Agregar material
                </button>
              </div>

              {rows.map((row, index) => {
                const totals = rowTotals(row, catalog);
                const options = row.type
                  ? catalogByType(catalog, row.type)
                  : catalog;
                const accessoryLabel =
                  totals.material?.measureType === "centimetro"
                    ? "Centímetros"
                    : "Cantidad";

                return (
                  <div
                    key={row.id}
                    className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-sm flex flex-col gap-sm"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                      <label className="flex flex-col gap-xs">
                        <span className="text-xs text-on-surface-variant">
                          Tipo
                        </span>
                        <select
                          value={row.type}
                          onChange={(event) =>
                            selectType(
                              row.id,
                              event.target.value as QuoteItemType | "",
                            )
                          }
                          className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-on-surface"
                        >
                          <option value="">Seleccioná tipo</option>
                          {materialSubcategories.map((type) => (
                            <option
                              key={type}
                              value={type}
                              disabled={catalogByType(catalog, type).length === 0}
                            >
                              {quoteTypeLabels[type]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="flex flex-col gap-xs">
                        <span className="text-xs text-on-surface-variant">
                          Material
                        </span>
                        <select
                          value={row.materialId}
                          onChange={(event) =>
                            selectMaterial(row.id, event.target.value)
                          }
                          disabled={!row.type}
                          className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-on-surface disabled:opacity-50"
                        >
                          <option value="">Seleccioná material</option>
                          {row.materialId && !catalogMaterial(row, catalog) ? (
                            <option value={row.materialId}>
                              {row.materialName || "Material anterior"}
                            </option>
                          ) : null}
                          {options.map((material) => (
                            <option key={material.id} value={material.id}>
                              {material.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {totals.type === "maderas" ? (
                      <div className="grid grid-cols-3 gap-sm">
                        <label className="flex flex-col gap-xs">
                          <span className="text-xs text-on-surface-variant">
                            Ancho (cm)
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.widthCm}
                            onChange={(event) =>
                              updateRow(row.id, { widthCm: event.target.value })
                            }
                            className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-on-surface"
                          />
                        </label>
                        <label className="flex flex-col gap-xs">
                          <span className="text-xs text-on-surface-variant">
                            Largo (cm)
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.lengthCm}
                            onChange={(event) =>
                              updateRow(row.id, { lengthCm: event.target.value })
                            }
                            className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-on-surface"
                          />
                        </label>
                        <label className="flex flex-col gap-xs">
                          <span className="text-xs text-on-surface-variant">
                            Cantidad
                          </span>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={row.quantity}
                            onChange={(event) =>
                              updateRow(row.id, { quantity: event.target.value })
                            }
                            className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-on-surface"
                          />
                        </label>
                      </div>
                    ) : null}

                    {totals.type === "pinturas" ? (
                      <label className="flex flex-col gap-xs">
                        <span className="text-xs text-on-surface-variant">
                          Gramos a usar
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.grams}
                          onChange={(event) =>
                            updateRow(row.id, { grams: event.target.value })
                          }
                          className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-on-surface"
                        />
                      </label>
                    ) : null}

                    {totals.type === "accesorios" ? (
                      <label className="flex flex-col gap-xs">
                        <span className="text-xs text-on-surface-variant">
                          {accessoryLabel}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step={
                            totals.material?.measureType === "centimetro"
                              ? "0.01"
                              : "1"
                          }
                          value={row.quantity}
                          onChange={(event) =>
                            updateRow(row.id, { quantity: event.target.value })
                          }
                          className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-on-surface"
                        />
                      </label>
                    ) : null}

                    <div className="flex items-end justify-between gap-sm text-sm">
                      <div className="text-on-surface-variant">
                        {totals.type === "maderas" ? (
                          <>
                            <p>
                              Superficie:{" "}
                              {totals.areaCm2.toLocaleString("es-AR", {
                                maximumFractionDigits: 2,
                              })}{" "}
                              cm² × {totals.quantity}
                            </p>
                            {totals.material?.pricePerCm2 ? (
                              <p>
                                {totals.material.pricePerCm2.toLocaleString(
                                  "es-AR",
                                  {
                                    style: "currency",
                                    currency: "ARS",
                                    maximumFractionDigits: 4,
                                  },
                                )}{" "}
                                / cm²
                              </p>
                            ) : null}
                          </>
                        ) : null}
                        {totals.type === "pinturas" &&
                        totals.material?.pricePerGram ? (
                          <p>
                            {totals.material.pricePerGram.toLocaleString(
                              "es-AR",
                              {
                                style: "currency",
                                currency: "ARS",
                                maximumFractionDigits: 4,
                              },
                            )}{" "}
                            / g
                          </p>
                        ) : null}
                        {totals.type === "accesorios" &&
                        totals.material?.unitPrice ? (
                          <p>
                            {formatMoney(totals.material.unitPrice)} /{" "}
                            {totals.material.measureType === "centimetro"
                              ? "cm"
                              : "unidad"}
                          </p>
                        ) : null}
                      </div>
                      <p className="font-semibold text-on-surface">
                        {formatMoney(totals.amount)}
                      </p>
                    </div>

                    {rows.length > 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setRows((prev) =>
                            prev.filter((item) => item.id !== row.id),
                          )
                        }
                        className="text-sm text-error text-left"
                      >
                        Quitar material {index + 1}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          <div className="rounded-xl bg-surface-container-high px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-on-surface-variant">Total</span>
            <span className="font-semibold text-on-surface">
              {formatMoney(totalAmount)}
            </span>
          </div>

          <div className="flex gap-sm mt-sm">
            <button
              type="submit"
              disabled={pending || catalog.length === 0}
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
                    <td className="py-2 pr-2">{formatMoney(quote.totalAmount)}</td>
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
