"use client";

import Link from "next/link";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  measureTypeLabels,
  materialSheetBases,
  measureUnitLabels,
  type Material,
} from "@/types/material";
import { formatMoney, formatNumber } from "../lib/format";
import {
  computePieceLayout,
  getWorkArea,
  pieceDoesNotFit,
  supportsPieceMode,
} from "../lib/piece-layout";
import { computeBatchItemCost, normalizeUnits } from "../lib/quote-batch";
import { buildQuoteItem, splitQuoteTotals } from "../lib/quote-items";
import { computeSheetUsage } from "../lib/sheet-usage";
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
  /** Unidades a producir, tal como se escribe (se guarda con la cotización). */
  units: string;
  onUnitsChange: (units: string) => void;
};

/**
 * Líneas de material de un cotizador: según el tipo del material pide
 * ancho × alto (área), cantidad (unidad) o minutos (tiempo).
 */
export function QuoteItemsEditor({
  rows,
  onChange,
  materials,
  units,
  onUnitsChange,
}: QuoteItemsEditorProps) {
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
  const products = normalizeUnits(units);

  // Madera/papel se compran por placa/hoja entera: para N unidades se cobra
  // el redondeo hacia arriba y el sobrante es material perdido. El resto se prorratea.
  const batchCosts = rows.map((row, index) => {
    const material = byId.get(row.materialId);
    const item = built[index];
    if (!material || !item) return 0;
    return computeBatchItemCost(material, item, products);
  });
  const batchTotal = batchCosts.reduce((sum, cost) => sum + cost, 0);

  function update(id: string, patch: Partial<QuoteItemRow>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function selectMaterial(id: string, materialId: string) {
    // Cambiar de material descarta las medidas: cada tipo pide datos distintos.
    update(id, {
      materialId,
      mode: "measures",
      pieceWidthCm: "",
      pieceHeightCm: "",
      widthCm: "",
      heightCm: "",
      quantity: "",
      fitsCount: "",
    });
  }

  return (
    <div className="flex flex-col gap-sm">
      {rows.map((row, index) => {
        const material = byId.get(row.materialId);
        const item = built[index];
        const sheets =
          material && item ? computeSheetUsage(material, item.quantityUsed, products) : null;
        const canUsePiece = material ? supportsPieceMode(material) : false;
        const pieceMode = canUsePiece && row.mode === "piece";
        const layout =
          material && pieceMode
            ? computePieceLayout(material, row.pieceWidthCm, row.pieceHeightCm)
            : null;
        const noFit =
          material && pieceMode
            ? pieceDoesNotFit(material, row.pieceWidthCm, row.pieceHeightCm)
            : false;

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

            {canUsePiece ? (
              <div
                role="group"
                aria-label="Cómo cargar las medidas"
                className="grid grid-cols-2 gap-xs rounded-lg bg-surface-container p-1 text-sm"
              >
                {(
                  [
                    ["measures", "Medidas del material"],
                    ["piece", "Medidas de una unidad"],
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={row.mode === mode}
                    onClick={() => update(row.id, { mode })}
                    className={
                      row.mode === mode
                        ? "rounded-md bg-primary-container px-2 py-2 text-white"
                        : "rounded-md px-2 py-2 text-on-surface-variant hover:bg-surface-container-high"
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}

            {pieceMode && material ? (
              <>
                <div className="grid grid-cols-2 gap-sm">
                  <label className="flex flex-col gap-xs">
                    <span className="text-xs text-on-surface-variant">
                      Ancho de la unidad (cm)
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={row.pieceWidthCm}
                      onChange={(event) =>
                        update(row.id, { pieceWidthCm: event.target.value })
                      }
                      className={numberInputClassName}
                    />
                  </label>
                  <label className="flex flex-col gap-xs">
                    <span className="text-xs text-on-surface-variant">
                      Alto de la unidad (cm)
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={row.pieceHeightCm}
                      onChange={(event) =>
                        update(row.id, { pieceHeightCm: event.target.value })
                      }
                      className={numberInputClassName}
                    />
                  </label>
                </div>
                {noFit ? (
                  <p role="alert" className="text-sm text-error">
                    La unidad no entra en el espacio de trabajo (
                    {formatNumber(getWorkArea(material).widthCm)}×
                    {formatNumber(getWorkArea(material).heightCm)} cm).
                  </p>
                ) : null}
                {layout ? (
                  <div className="rounded-lg bg-surface-container px-3 py-2 text-sm text-on-surface-variant">
                    <p>
                      En el espacio de trabajo de {formatNumber(layout.workWidthCm)}×
                      {formatNumber(layout.workHeightCm)} cm entran{" "}
                      <strong className="text-on-surface">{layout.perSheet}</strong>{" "}
                      ({layout.columns}×{layout.rows}
                      {layout.rotated ? ", giradas" : ""}) por{" "}
                      {materialSheetBases[material.category ?? "other"]?.unit ?? "placa"}.
                    </p>
                    <p>
                      Aprovechamiento {formatNumber(layout.usedPercent, 1)}%: la pérdida (
                      {formatNumber(layout.wastePercent, 1)}%) se suma al costo de cada
                      unidad.
                    </p>
                  </div>
                ) : null}
              </>
            ) : null}

            {material?.measureType === "area_cm2" && !pieceMode ? (
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

            {material && material.measureType !== "time_minutes" && !pieceMode ? (
              <label className="flex flex-col gap-xs">
                <span className="text-xs text-on-surface-variant">
                  {material.measureType === "area_cm2"
                    ? "¿Cuántas unidades entran en esas medidas? (opcional)"
                    : "¿Cuántas unidades entran en esa cantidad? (opcional)"}
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="1"
                  value={row.fitsCount}
                  onChange={(event) => update(row.id, { fitsCount: event.target.value })}
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
                      {measureUnitLabels[material.measureType]} por producto
                    </p>
                  ) : null}
                  {sheets && item ? (
                    <p>
                      = {formatNumber(sheets.sheetsPerProduct, 3)} {sheets.unit} (
                      {sheets.label}) por producto
                    </p>
                  ) : null}
                  <p>
                    {formatMoney(material.costPerUnit, 4)} /{" "}
                    {measureUnitLabels[material.measureType]}
                  </p>
                  {sheets ? (
                    <p>
                      Cada {sheets.unit} de {sheets.label} vale{" "}
                      {formatMoney(sheets.costPerSheet)}
                    </p>
                  ) : null}
                </div>
                <p className="font-semibold text-on-surface">
                  {formatMoney(item?.calculatedCost ?? 0)}
                </p>
              </div>
            ) : null}

            {material && item && products > 1 ? (
              <div className="rounded-lg bg-surface-container px-3 py-2 text-sm flex items-center justify-between gap-sm">
                <p className="text-on-surface-variant">
                  Para {products} unidades:{" "}
                  {sheets ? (
                    <>
                      {formatNumber(sheets.sheetsNeeded, 2)} {sheets.unit}s → comprás{" "}
                      <strong className="text-on-surface">
                        {sheets.sheetsToBuy} {sheets.unit}
                        {sheets.sheetsToBuy === 1 ? "" : "s"}
                      </strong>{" "}
                      ({formatMoney(sheets.batchCost)})
                      {sheets.wasteCm2 > 0 ? (
                        <>
                          {" "}
                          · sobrante perdido: {formatNumber(sheets.wasteCm2)} cm²
                        </>
                      ) : null}
                    </>
                  ) : (
                    <>
                      {formatNumber(item.quantityUsed * products)}{" "}
                      {measureUnitLabels[material.measureType]}
                    </>
                  )}
                </p>
                <p className="font-semibold text-on-surface whitespace-nowrap">
                  {formatMoney(batchCosts[index])}
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

      <label className="flex flex-col gap-xs">
        <span className="text-sm font-medium text-on-surface">
          ¿Cuántas unidades vas a producir?
        </span>
        <input
          type="number"
          min="1"
          step="1"
          name="units"
          value={units}
          onChange={(event) => onUnitsChange(event.target.value)}
          className={numberInputClassName}
        />
      </label>

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
          <dt className="font-semibold text-on-surface">Costo por unidad</dt>
          <dd className="font-semibold text-on-surface whitespace-nowrap">
            {formatMoney(totals.totalAmount)}
          </dd>
        </div>
        {products > 1 ? (
          <div className="flex items-center justify-between gap-sm">
            <dt className="font-semibold text-on-surface">
              Costo total para {products} unidades
            </dt>
            <dd className="font-semibold text-on-surface whitespace-nowrap">
              {formatMoney(batchTotal)}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
