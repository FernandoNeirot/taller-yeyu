"use client";

import Link from "next/link";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  measureTypeLabels,
  measureUnitLabels,
  type Material,
} from "@/types/material";
import { formatMoney, formatNumber } from "../lib/format";
import { buildQuoteItem, splitQuoteTotals } from "../lib/quote-items";
import {
  emptyQuoteRow,
  rowToInput,
  type QuoteItemRow,
} from "../lib/quote-rows";

const numberInputClassName =
  "w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-on-surface";

type QuoteItemsEditorProps = {
  rows: QuoteItemRow[];
  onChange: (rows: QuoteItemRow[]) => void;
  materials: Material[];
};

/**
 * Líneas de material de un cotizador: según el tipo del material pide
 * ancho × alto (área), cantidad (unidad) o minutos (tiempo).
 */
export function QuoteItemsEditor({ rows, onChange, materials }: QuoteItemsEditorProps) {
  if (materials.length === 0) {
    return (
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-md text-sm text-on-surface-variant">
        Todavía no hay materiales cargados. Cargalos en{" "}
        <Link href="/admin/materiales" className="text-primary">
          Materiales
        </Link>
        .
      </div>
    );
  }

  const byId = new Map(materials.map((material) => [material.id, material]));
  const built = rows.map((row) => {
    const material = byId.get(row.materialId);
    return material ? buildQuoteItem(material, rowToInput(row)) : null;
  });
  const totals = splitQuoteTotals(built.flatMap((item) => (item ? [item] : [])));

  function update(id: string, patch: Partial<QuoteItemRow>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function selectMaterial(id: string, materialId: string) {
    // Cambiar de material descarta las medidas: cada tipo pide datos distintos.
    update(id, { materialId, widthCm: "", heightCm: "", quantity: "" });
  }

  return (
    <div className="flex flex-col gap-sm">
      {rows.map((row, index) => {
        const material = byId.get(row.materialId);
        const item = built[index];

        return (
          <div
            key={row.id}
            className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-sm flex flex-col gap-sm"
          >
            <div className="flex flex-col gap-xs">
              <span className="text-xs text-on-surface-variant">Material</span>
              <SearchableSelect
                size="sm"
                value={row.materialId}
                onChange={(materialId) => selectMaterial(row.id, materialId)}
                placeholder="Seleccioná material"
                searchPlaceholder="Buscar material..."
                options={materials.map((option) => ({
                  value: option.id,
                  label: `${option.name} · ${measureTypeLabels[option.measureType]}`,
                }))}
              />
            </div>

            {material?.measureType === "area_cm2" ? (
              <div className="grid grid-cols-2 gap-sm">
                <label className="flex flex-col gap-xs">
                  <span className="text-xs text-on-surface-variant">Ancho (cm)</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={row.widthCm}
                    onChange={(event) => update(row.id, { widthCm: event.target.value })}
                    className={numberInputClassName}
                  />
                </label>
                <label className="flex flex-col gap-xs">
                  <span className="text-xs text-on-surface-variant">Alto (cm)</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={row.heightCm}
                    onChange={(event) => update(row.id, { heightCm: event.target.value })}
                    className={numberInputClassName}
                  />
                </label>
              </div>
            ) : null}

            {material && material.measureType !== "area_cm2" ? (
              <label className="flex flex-col gap-xs">
                <span className="text-xs text-on-surface-variant">
                  {material.measureType === "time_minutes" ? "Minutos" : "Cantidad"}
                </span>
                <input
                  type="number"
                  min="0"
                  step={material.measureType === "time_minutes" ? "any" : "1"}
                  value={row.quantity}
                  onChange={(event) => update(row.id, { quantity: event.target.value })}
                  className={numberInputClassName}
                />
              </label>
            ) : null}

            {material ? (
              <div className="flex items-end justify-between gap-sm text-sm">
                <div className="text-on-surface-variant">
                  {item ? (
                    <p>
                      Usa {formatNumber(item.quantityUsed)}{" "}
                      {measureUnitLabels[material.measureType]}
                    </p>
                  ) : null}
                  <p>
                    {formatMoney(material.costPerUnit, 4)} /{" "}
                    {measureUnitLabels[material.measureType]}
                  </p>
                </div>
                <p className="font-semibold text-on-surface">
                  {formatMoney(item?.calculatedCost ?? 0)}
                </p>
              </div>
            ) : null}

            {rows.length > 1 ? (
              <button
                type="button"
                onClick={() => onChange(rows.filter((other) => other.id !== row.id))}
                className="text-sm text-error text-left"
              >
                Quitar material {index + 1}
              </button>
            ) : null}
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => onChange([...rows, emptyQuoteRow()])}
        className="self-start text-sm text-primary"
      >
        + Agregar material
      </button>

      <dl
        aria-label="Resumen de costos"
        className="rounded-xl bg-surface-container-high px-4 py-3 flex flex-col gap-xs text-sm"
      >
        <div className="flex items-center justify-between gap-sm">
          <dt className="text-on-surface-variant">
            Costo de Materiales Físicos (Gasto)
          </dt>
          <dd className="font-medium text-on-surface whitespace-nowrap">
            {formatMoney(totals.totalMaterialCost)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-sm">
          <dt className="text-on-surface-variant">
            Costo de Tiempo (Retribución Máquina/Mano de obra)
          </dt>
          <dd className="font-medium text-on-surface whitespace-nowrap">
            {formatMoney(totals.totalTimeCost)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-sm border-t border-outline-variant/30 pt-xs">
          <dt className="font-semibold text-on-surface">Costo Total Base</dt>
          <dd className="font-semibold text-on-surface whitespace-nowrap">
            {formatMoney(totals.totalAmount)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
