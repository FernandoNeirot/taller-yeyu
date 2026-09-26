"use client";

import { useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { MoneyInput } from "@/components/ui/money-input";
import { PriceCalculator } from "@/components/ui/price-calculator";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { formatProductPrice } from "../lib/format-price";
import {
  DEFAULT_LABOR_HOURLY_RATE,
  DEFAULT_MACHINE_HOURLY_RATE,
  WOOD_NATURAL_SHEET_PRICE,
  WOOD_SHEET_LENGTH_CM,
  WOOD_SHEET_WIDTH_CM,
  WOOD_WHITE_FACE_SHEET_PRICE,
  computeAccessoryAmount,
  computeCostQuoteTotal,
  computeMachineAmount,
  computeWoodAmount,
  computeWoodsAmount,
  finalizeCostQuote,
  isWoodFaceType,
  woodsFromQuote,
  type ProductCostQuote,
  type WoodFaceType,
} from "../lib/cost-quote";
import type { MaterialCatalogItem } from "@/features/quotes/types";

const fieldClassName =
  "w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary";

export type WoodFormRow = {
  id: string;
  quantity: string;
  widthCm: string;
  lengthCm: string;
  face: "" | WoodFaceType;
};

export type CostQuoteFormState = {
  woods: WoodFormRow[];
  machineMinutes: string;
  machineHourlyRate: string;
  laborMinutes: string;
  laborHourlyRate: string;
  accessories: {
    id: string;
    materialId: string;
    quantity: string;
  }[];
  usesPaint: boolean;
  paintAmount: string;
};

export const emptyCostQuoteForm: CostQuoteFormState = {
  woods: [],
  machineMinutes: "",
  machineHourlyRate: String(DEFAULT_MACHINE_HOURLY_RATE),
  laborMinutes: "",
  laborHourlyRate: String(DEFAULT_LABOR_HOURLY_RATE),
  accessories: [],
  usesPaint: false,
  paintAmount: "",
};

function newRowId(prefix: string) {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function emptyWoodRow(): WoodFormRow {
  return {
    id: newRowId("wood"),
    quantity: "",
    widthCm: "",
    lengthCm: "",
    face: "",
  };
}

export function costQuoteToForm(
  quote?: ProductCostQuote,
): CostQuoteFormState {
  if (!quote) return emptyCostQuoteForm;
  return {
    woods: woodsFromQuote(quote).map((wood) => ({
      id: wood.id,
      quantity: wood.quantity != null ? String(wood.quantity) : "",
      widthCm: wood.widthCm != null ? String(wood.widthCm) : "",
      lengthCm: wood.lengthCm != null ? String(wood.lengthCm) : "",
      face: wood.face ?? "",
    })),
    machineMinutes:
      quote.machineMinutes != null ? String(quote.machineMinutes) : "",
    machineHourlyRate:
      quote.machineHourlyRate != null
        ? String(quote.machineHourlyRate)
        : String(DEFAULT_MACHINE_HOURLY_RATE),
    laborMinutes: quote.laborMinutes != null ? String(quote.laborMinutes) : "",
    laborHourlyRate:
      quote.laborHourlyRate != null
        ? String(quote.laborHourlyRate)
        : String(DEFAULT_LABOR_HOURLY_RATE),
    accessories: (quote.accessories ?? []).map((item) => ({
      id: item.id,
      materialId: item.materialId,
      quantity: String(item.quantity),
    })),
    usesPaint: Boolean(quote.usesPaint),
    paintAmount: quote.paintAmount != null ? String(quote.paintAmount) : "",
  };
}

export function costQuoteFormTotal(
  value: CostQuoteFormState,
  accessories: MaterialCatalogItem[],
) {
  const catalogById = new Map(accessories.map((item) => [item.id, item]));
  const quote = finalizeCostQuote(
    {
      woods: value.woods.map((row) => ({
        id: row.id,
        quantity: toNumber(row.quantity) || undefined,
        widthCm: toNumber(row.widthCm) || undefined,
        lengthCm: toNumber(row.lengthCm) || undefined,
        face: isWoodFaceType(row.face) ? row.face : undefined,
      })),
      machineMinutes: toNumber(value.machineMinutes) || undefined,
      machineHourlyRate: toNumber(value.machineHourlyRate) || undefined,
      laborMinutes: toNumber(value.laborMinutes) || undefined,
      laborHourlyRate: toNumber(value.laborHourlyRate) || undefined,
      accessories: value.accessories
        .map((row) => {
          const material = catalogById.get(row.materialId);
          const quantity = toNumber(row.quantity);
          if (!material || quantity <= 0) return null;
          return {
            id: row.id,
            materialId: material.id,
            materialName: material.name,
            quantity,
            unitPrice: material.unitPrice ?? 0,
            measureType: material.measureType,
            amount: computeAccessoryAmount(quantity, material.unitPrice ?? 0),
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
      usesPaint: value.usesPaint,
      paintAmount: toNumber(value.paintAmount) || undefined,
    },
    accessories,
  );
  return quote?.totalAmount ?? 0;
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMinutes(value: number) {
  if (!value) return "";
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}

type MinutesAdderProps = {
  minutes: string;
  onChange: (minutes: string) => void;
  label?: string;
};

function MinutesAdder({
  minutes,
  onChange,
  label = "Minutos por unidad",
}: MinutesAdderProps) {
  const [open, setOpen] = useState(false);
  const initialValue = Number.isFinite(Number(minutes)) && Number(minutes) > 0 ? minutes : "";

  return (
    <div className="flex items-end gap-xs">
      <label className="flex min-w-0 flex-1 flex-col gap-xs">
        <span className="text-xs text-on-surface-variant">{label}</span>
        <input
          inputMode="decimal"
          value={minutes}
          placeholder="Opcional"
          onChange={(event) => onChange(event.target.value)}
          className={fieldClassName}
        />
      </label>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir calculadora"
        title="Calculadora"
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
      >
        <MaterialIcon name="calculate" />
      </button>
      <PriceCalculator
        open={open}
        initialValue={initialValue}
        prefix=""
        applyLabel="Usar minutos"
        onClose={() => setOpen(false)}
        onApply={(rawValue) => {
          const parsed = Number(rawValue);
          onChange(Number.isFinite(parsed) && parsed > 0 ? formatMinutes(parsed) : "");
        }}
      />
    </div>
  );
}

type ProductCostQuoteFieldsProps = {
  value: CostQuoteFormState;
  onChange: (next: CostQuoteFormState) => void;
  accessories: MaterialCatalogItem[];
};

export function ProductCostQuoteFields({
  value,
  onChange,
  accessories,
}: ProductCostQuoteFieldsProps) {
  const catalogById = useMemo(
    () => new Map(accessories.map((item) => [item.id, item])),
    [accessories],
  );

  const computed = useMemo(() => {
    const woodRows = value.woods.map((row) => {
      const face = isWoodFaceType(row.face) ? row.face : undefined;
      const amount = computeWoodAmount({
        quantity: toNumber(row.quantity),
        widthCm: toNumber(row.widthCm),
        lengthCm: toNumber(row.lengthCm),
        face,
      });
      return { ...row, face, amount };
    });
    const woodAmount = computeWoodsAmount(
      woodRows.map((row) => ({ id: row.id, amount: row.amount })),
    );
    const machineAmount = computeMachineAmount({
      minutes: toNumber(value.machineMinutes),
      hourlyRate: toNumber(value.machineHourlyRate),
    });
    const laborAmount = computeMachineAmount({
      minutes: toNumber(value.laborMinutes),
      hourlyRate: toNumber(value.laborHourlyRate),
    });
    const accessoryRows = value.accessories.map((row) => {
      const material = catalogById.get(row.materialId);
      const quantity = toNumber(row.quantity);
      const unitPrice = material?.unitPrice ?? 0;
      return {
        ...row,
        material,
        amount: computeAccessoryAmount(quantity, unitPrice),
      };
    });
    const quote = finalizeCostQuote(
      {
        woods: woodRows.map((row) => ({
          id: row.id,
          quantity: toNumber(row.quantity) || undefined,
          widthCm: toNumber(row.widthCm) || undefined,
          lengthCm: toNumber(row.lengthCm) || undefined,
          face: row.face,
          amount: row.amount,
        })),
        woodAmount,
        machineMinutes: toNumber(value.machineMinutes) || undefined,
        machineHourlyRate: toNumber(value.machineHourlyRate) || undefined,
        machineAmount,
        laborMinutes: toNumber(value.laborMinutes) || undefined,
        laborHourlyRate: toNumber(value.laborHourlyRate) || undefined,
        laborAmount,
        accessories: accessoryRows
          .filter((row) => row.material && toNumber(row.quantity) > 0)
          .map((row) => ({
            id: row.id,
            materialId: row.materialId,
            materialName: row.material?.name ?? "",
            quantity: toNumber(row.quantity),
            unitPrice: row.material?.unitPrice ?? 0,
            measureType: row.material?.measureType,
            amount: row.amount,
          })),
        usesPaint: value.usesPaint,
        paintAmount: toNumber(value.paintAmount) || undefined,
      },
      accessories,
    );

    return {
      woodRows,
      woodAmount,
      machineAmount,
      laborAmount,
      accessoryRows,
      total: quote ? computeCostQuoteTotal(quote) : 0,
      payload: quote ?? null,
    };
  }, [accessories, catalogById, value]);

  function addWood() {
    onChange({
      ...value,
      woods: [...value.woods, emptyWoodRow()],
    });
  }

  function addAccessory() {
    onChange({
      ...value,
      accessories: [
        ...value.accessories,
        {
          id: newRowId("acc"),
          materialId: accessories[0]?.id ?? "",
          quantity: "1",
        },
      ],
    });
  }

  return (
    <div className="flex flex-col gap-sm">
      <p className="text-xs text-on-surface-variant">
        Opcional. Calculá el costo interno del producto. La tabla de referencia
        es de {WOOD_SHEET_WIDTH_CM} × {WOOD_SHEET_LENGTH_CM} cm.
      </p>

      <input
        type="hidden"
        name="costQuote"
        value={computed.payload ? JSON.stringify(computed.payload) : ""}
      />

      <div className="flex flex-col gap-xs">
        <div className="flex items-center justify-between gap-sm">
          <p className="text-sm text-on-surface-variant">Maderas</p>
          <button
            type="button"
            onClick={addWood}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <MaterialIcon name="add" className="text-sm" />
            Agregar madera
          </button>
        </div>
        {value.woods.length === 0 ? (
          <p className="text-xs text-on-surface-variant">
            Podés cargar más de una madera, cada una con su medida y tipo.
          </p>
        ) : null}
        {value.woods.map((row, index) => {
          const amount = computed.woodRows[index]?.amount ?? 0;
          return (
            <div
              key={row.id}
              className="flex flex-col gap-sm rounded-lg border border-outline-variant/25 p-sm"
            >
              <div className="flex items-center justify-between gap-sm">
                <p className="text-xs font-semibold text-on-surface">
                  Madera {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...value,
                      woods: value.woods.filter((item) => item.id !== row.id),
                    })
                  }
                  className="text-xs text-on-surface-variant hover:text-error"
                >
                  Quitar
                </button>
              </div>
              <div className="grid grid-cols-2 gap-sm">
                <label className="flex flex-col gap-xs">
                  <span className="text-xs text-on-surface-variant">
                    Cantidad de tablas
                  </span>
                  <input
                    inputMode="decimal"
                    value={row.quantity}
                    placeholder="Opcional"
                    onChange={(event) =>
                      onChange({
                        ...value,
                        woods: value.woods.map((item) =>
                          item.id === row.id
                            ? { ...item, quantity: event.target.value }
                            : item,
                        ),
                      })
                    }
                    className={fieldClassName}
                  />
                </label>
                <label className="flex flex-col gap-xs">
                  <span className="text-xs text-on-surface-variant">
                    Tipo de tabla
                  </span>
                  <select
                    value={row.face}
                    onChange={(event) =>
                      onChange({
                        ...value,
                        woods: value.woods.map((item) =>
                          item.id === row.id
                            ? {
                                ...item,
                                face: event.target
                                  .value as WoodFormRow["face"],
                              }
                            : item,
                        ),
                      })
                    }
                    className={fieldClassName}
                  >
                    <option value="">Sin especificar</option>
                    <option value="natural">
                      Sin frente blanco (
                      {formatProductPrice(WOOD_NATURAL_SHEET_PRICE)})
                    </option>
                    <option value="white">
                      Con frente blanco (
                      {formatProductPrice(WOOD_WHITE_FACE_SHEET_PRICE)})
                    </option>
                  </select>
                </label>
                <label className="flex flex-col gap-xs">
                  <span className="text-xs text-on-surface-variant">
                    Ancho (cm)
                  </span>
                  <input
                    inputMode="decimal"
                    value={row.widthCm}
                    placeholder="Opcional"
                    onChange={(event) =>
                      onChange({
                        ...value,
                        woods: value.woods.map((item) =>
                          item.id === row.id
                            ? { ...item, widthCm: event.target.value }
                            : item,
                        ),
                      })
                    }
                    className={fieldClassName}
                  />
                </label>
                <label className="flex flex-col gap-xs">
                  <span className="text-xs text-on-surface-variant">
                    Largo (cm)
                  </span>
                  <input
                    inputMode="decimal"
                    value={row.lengthCm}
                    placeholder="Opcional"
                    onChange={(event) =>
                      onChange({
                        ...value,
                        woods: value.woods.map((item) =>
                          item.id === row.id
                            ? { ...item, lengthCm: event.target.value }
                            : item,
                        ),
                      })
                    }
                    className={fieldClassName}
                  />
                </label>
              </div>
              {amount > 0 ? (
                <p className="text-xs text-on-surface-variant">
                  Costo: {formatProductPrice(amount)}
                </p>
              ) : null}
            </div>
          );
        })}
        {computed.woodAmount > 0 ? (
          <p className="text-xs text-on-surface-variant">
            Costo maderas: {formatProductPrice(computed.woodAmount)}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-xs">
        <p className="text-sm text-on-surface-variant">Tiempo de máquina</p>
        <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
          <MinutesAdder
            minutes={value.machineMinutes}
            onChange={(machineMinutes) => onChange({ ...value, machineMinutes })}
          />
          <label className="flex flex-col gap-xs">
            <span className="text-xs text-on-surface-variant">
              Valor hora máquina
            </span>
            <MoneyInput
              value={value.machineHourlyRate}
              onChange={(machineHourlyRate) =>
                onChange({ ...value, machineHourlyRate })
              }
            />
          </label>
        </div>
        {computed.machineAmount > 0 ? (
          <p className="text-xs text-on-surface-variant">
            Costo máquina: {formatProductPrice(computed.machineAmount)}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-xs">
        <p className="text-sm text-on-surface-variant">
          Tiempo manual empleado
        </p>
        <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
          <MinutesAdder
            label="Minutos"
            minutes={value.laborMinutes}
            onChange={(laborMinutes) => onChange({ ...value, laborMinutes })}
          />
          <label className="flex flex-col gap-xs">
            <span className="text-xs text-on-surface-variant">
              Valor hora
            </span>
            <MoneyInput
              value={value.laborHourlyRate}
              onChange={(laborHourlyRate) =>
                onChange({ ...value, laborHourlyRate })
              }
            />
          </label>
        </div>
        {computed.laborAmount > 0 ? (
          <p className="text-xs text-on-surface-variant">
            Costo manual: {formatProductPrice(computed.laborAmount)}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-xs">
        <div className="flex items-center justify-between gap-sm">
          <p className="text-sm text-on-surface-variant">Adicionales</p>
          <button
            type="button"
            onClick={addAccessory}
            disabled={accessories.length === 0}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
          >
            <MaterialIcon name="add" className="text-sm" />
            Agregar ítem
          </button>
        </div>
        {accessories.length === 0 ? (
          <p className="text-xs text-on-surface-variant">
            No hay accesorios cargados en Control Financiero → Materiales →
            Accesorios.
          </p>
        ) : null}
        {value.accessories.map((row, index) => {
          const totals = computed.accessoryRows[index];
          const material = totals?.material;
          return (
            <div
              key={row.id}
              className="flex flex-col gap-sm rounded-lg border border-outline-variant/25 p-sm"
            >
              <label className="flex flex-col gap-xs">
                <span className="text-xs text-on-surface-variant">Ítem</span>
                <SearchableSelect
                  size="sm"
                  value={row.materialId}
                  onChange={(materialId) =>
                    onChange({
                      ...value,
                      accessories: value.accessories.map((item) =>
                        item.id === row.id ? { ...item, materialId } : item,
                      ),
                    })
                  }
                  placeholder="Elegí un accesorio"
                  searchPlaceholder="Buscar accesorio..."
                  options={[
                    ...(row.materialId && !material
                      ? [{ value: row.materialId, label: row.materialId }]
                      : []),
                    ...accessories.map((item) => ({
                      value: item.id,
                      label: item.name,
                    })),
                  ]}
                />
              </label>
              <label className="flex flex-col gap-xs">
                <span className="text-xs text-on-surface-variant">
                  Cantidad
                  {material?.measureType === "centimetro" ? " (cm)" : ""}
                </span>
                <input
                  inputMode="decimal"
                  value={row.quantity}
                  onChange={(event) =>
                    onChange({
                      ...value,
                      accessories: value.accessories.map((item) =>
                        item.id === row.id
                          ? { ...item, quantity: event.target.value }
                          : item,
                      ),
                    })
                  }
                  className={fieldClassName}
                />
              </label>
              <div className="flex items-center justify-between gap-sm text-xs text-on-surface-variant">
                <span>
                  {material?.unitPrice
                    ? `${formatProductPrice(material.unitPrice)} / ${
                        material.measureType === "centimetro" ? "cm" : "u"
                      }`
                    : "Sin precio"}
                </span>
                <span className="text-on-surface">
                  {formatProductPrice(totals?.amount ?? 0)}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    accessories: value.accessories.filter(
                      (item) => item.id !== row.id,
                    ),
                  })
                }
                className="self-start text-xs text-on-surface-variant hover:text-error"
              >
                Quitar
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-xs">
        <label className="inline-flex items-center gap-xs">
          <input
            type="checkbox"
            checked={value.usesPaint}
            onChange={(event) =>
              onChange({
                ...value,
                usesPaint: event.target.checked,
                paintAmount: event.target.checked ? value.paintAmount : "",
              })
            }
          />
          <span className="text-sm text-on-surface">Usa pintura</span>
        </label>
        {value.usesPaint ? (
          <label className="flex flex-col gap-xs">
            <span className="text-xs text-on-surface-variant">
              Costo aproximado de pintura
            </span>
            <MoneyInput
              value={value.paintAmount}
              onChange={(paintAmount) => onChange({ ...value, paintAmount })}
            />
          </label>
        ) : null}
      </div>

      <p className="border-t border-outline-variant/25 pt-sm font-semibold text-on-surface">
        Costo estimado: {formatProductPrice(computed.total)}
      </p>
    </div>
  );
}
