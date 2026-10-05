"use client";

import { useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { MoneyInput } from "@/components/ui/money-input";
import { CalculatorButton } from "@/components/ui/price-calculator";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { materialSubcategoryLabels } from "@/features/finance/types";
import type { MaterialCatalogItem } from "@/features/quotes/types";
import { formatProductPrice } from "../lib/format-price";
import {
  DEFAULT_LABOR_HOURLY_RATE,
  DEFAULT_MACHINE_HOURLY_RATE,
  finalizeCostQuote,
  isWoodFaceType,
  woodsFromQuote,
  type ProductCostLine,
  type ProductCostLineUnit,
  type ProductCostQuote,
  type WoodFaceType,
} from "../lib/cost-quote";

const fieldClassName =
  "w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary";

export type CostQuoteLineForm = {
  id: string;
  kind: "wood" | "catalog" | "custom";
  catalogType: "" | "maderas" | "pinturas" | "accesorios";
  materialId: string;
  description: string;
  quantity: string;
  unit: ProductCostLineUnit;
  unitPrice: string;
  widthCm: string;
  lengthCm: string;
  face: "" | WoodFaceType;
};

export type CostQuoteFormState = {
  lines: CostQuoteLineForm[];
};

export const emptyCostQuoteForm: CostQuoteFormState = {
  lines: [],
};

function newRowId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `line-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function textNumber(value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return "";
  return String(value);
}

function perMinute(hourlyRate: number) {
  if (!hourlyRate) return "";
  return String(Math.round((hourlyRate / 60) * 100) / 100);
}

function blankLine(
  line: Partial<CostQuoteLineForm> & Pick<CostQuoteLineForm, "kind" | "description" | "unit">,
): CostQuoteLineForm {
  return {
    id: line.id || newRowId(),
    kind: line.kind,
    catalogType: line.catalogType ?? "",
    materialId: line.materialId ?? "",
    description: line.description,
    quantity: line.quantity ?? "",
    unit: line.unit,
    unitPrice: line.unitPrice ?? "",
    widthCm: line.widthCm ?? "",
    lengthCm: line.lengthCm ?? "",
    face: line.face ?? "",
  };
}

export function costQuoteToForm(quote?: ProductCostQuote): CostQuoteFormState {
  if (!quote) return emptyCostQuoteForm;
  if (quote.lines?.length) {
    return {
      lines: quote.lines.map((line) =>
        blankLine({
          id: line.id,
          kind: line.kind,
          catalogType: line.catalogType ?? "",
          materialId: line.materialId ?? "",
          description: line.description,
          quantity: textNumber(line.quantity),
          unit: line.unit,
          unitPrice: textNumber(line.unitPrice),
          widthCm: textNumber(line.widthCm),
          lengthCm: textNumber(line.lengthCm),
          face: line.face ?? "",
        }),
      ),
    };
  }

  const lines: CostQuoteLineForm[] = [];
  for (const wood of woodsFromQuote(quote)) {
    lines.push(
      blankLine({
        id: wood.id,
        kind: "wood",
        description:
          wood.face === "white" ? "Madera con frente blanco" : "Madera",
        quantity: textNumber(wood.quantity),
        unit: "tabla",
        widthCm: textNumber(wood.widthCm),
        lengthCm: textNumber(wood.lengthCm),
        face: wood.face ?? "",
      }),
    );
  }
  if (quote.machineMinutes) {
    lines.push(
      blankLine({
        kind: "custom",
        description: "Máquina",
        quantity: textNumber(quote.machineMinutes),
        unit: "minuto",
        unitPrice: perMinute(quote.machineHourlyRate ?? DEFAULT_MACHINE_HOURLY_RATE),
      }),
    );
  }
  if (quote.laborMinutes) {
    lines.push(
      blankLine({
        kind: "custom",
        description: "Mano de obra",
        quantity: textNumber(quote.laborMinutes),
        unit: "minuto",
        unitPrice: perMinute(quote.laborHourlyRate ?? DEFAULT_LABOR_HOURLY_RATE),
      }),
    );
  }
  for (const item of quote.accessories ?? []) {
    lines.push(
      blankLine({
        id: item.id,
        kind: "catalog",
        catalogType: "accesorios",
        materialId: item.materialId,
        description: item.materialName,
        quantity: textNumber(item.quantity),
        unit: item.measureType === "centimetro" ? "cm" : "unidad",
        unitPrice: textNumber(item.unitPrice),
      }),
    );
  }
  if (quote.usesPaint && quote.paintAmount) {
    lines.push(
      blankLine({
        kind: "custom",
        description: "Pintura",
        quantity: "1",
        unit: "unidad",
        unitPrice: textNumber(quote.paintAmount),
      }),
    );
  }
  return { lines };
}

function formToQuote(value: CostQuoteFormState): ProductCostQuote {
  const lines: ProductCostLine[] = value.lines.map((line) => ({
    id: line.id,
    kind: line.kind,
    catalogType: line.catalogType || undefined,
    materialId: line.materialId || undefined,
    description: line.description,
    quantity: toNumber(line.quantity),
    unit: line.unit,
    unitPrice: toNumber(line.unitPrice),
    amount: 0,
    widthCm: toNumber(line.widthCm) || undefined,
    lengthCm: toNumber(line.lengthCm) || undefined,
    face: isWoodFaceType(line.face) ? line.face : undefined,
  }));
  return { lines };
}

export function costQuoteFormTotal(
  value: CostQuoteFormState,
  materials: MaterialCatalogItem[],
) {
  return finalizeCostQuote(formToQuote(value), materials)?.totalAmount ?? 0;
}

export function costQuoteMinutes(value: CostQuoteFormState) {
  return value.lines.reduce((sum, line) => {
    if (line.unit !== "minuto") return sum;
    return sum + toNumber(line.quantity);
  }, 0);
}

function quantityLabel(line: CostQuoteLineForm) {
  const quantity = line.quantity || "0";
  if (line.unit === "tabla") {
    const size =
      line.widthCm && line.lengthCm ? `${line.widthCm} × ${line.lengthCm} cm · ` : "";
    return `${size}${quantity} tablas`;
  }
  if (line.unit === "minuto") return `${quantity} min`;
  if (line.unit === "gramo") return `${quantity} g`;
  if (line.unit === "cm") return `${quantity} cm`;
  return quantity;
}

function linePreview(
  line: CostQuoteLineForm,
  materials: MaterialCatalogItem[],
) {
  const quote = finalizeCostQuote(
    { lines: formToQuote({ lines: [line] }).lines },
    materials,
  );
  return quote?.lines?.[0]?.amount ?? 0;
}

type ProductCostQuoteFieldsProps = {
  value: CostQuoteFormState;
  onChange: (next: CostQuoteFormState) => void;
  materials: MaterialCatalogItem[];
};

export function ProductCostQuoteFields({
  value,
  onChange,
  materials,
}: ProductCostQuoteFieldsProps) {
  const [catalogId, setCatalogId] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [lengthCm, setLengthCm] = useState("");
  const [catalogQuantity, setCatalogQuantity] = useState("1");
  const [customDescription, setCustomDescription] = useState("");
  const [customQuantity, setCustomQuantity] = useState("");
  const [customUnit, setCustomUnit] = useState<"unidad" | "minuto">("unidad");
  const [customPrice, setCustomPrice] = useState("");
  const [formError, setFormError] = useState("");

  const selected = useMemo(
    () => materials.find((item) => item.id === catalogId),
    [catalogId, materials],
  );

  const payload = useMemo(
    () => finalizeCostQuote(formToQuote(value), materials) ?? null,
    [materials, value],
  );
  const amounts = new Map(
    (payload?.lines ?? []).map((line) => [line.id, line.amount]),
  );

  function addLine(line: CostQuoteLineForm) {
    onChange({ lines: [...value.lines, line] });
    setFormError("");
  }

  function addCatalogMaterial() {
    if (!selected) {
      setFormError("Elegí un material cargado.");
      return;
    }
    const quantity = toNumber(catalogQuantity);
    if (quantity <= 0) {
      setFormError("La cantidad tiene que ser mayor a cero.");
      return;
    }
    if (selected.type === "maderas") {
      if (toNumber(widthCm) <= 0 || toNumber(lengthCm) <= 0) {
        setFormError("Para la madera cargá ancho, largo y cantidad de tablas.");
        return;
      }
      addLine(
        blankLine({
          kind: "catalog",
          catalogType: "maderas",
          materialId: selected.id,
          description: selected.name,
          quantity: catalogQuantity,
          unit: "tabla",
          unitPrice: textNumber(selected.pricePerCm2),
          widthCm,
          lengthCm,
        }),
      );
    } else if (selected.type === "pinturas") {
      addLine(
        blankLine({
          kind: "catalog",
          catalogType: "pinturas",
          materialId: selected.id,
          description: selected.name,
          quantity: catalogQuantity,
          unit: "gramo",
          unitPrice: textNumber(selected.pricePerGram),
        }),
      );
    } else {
      addLine(
        blankLine({
          kind: "catalog",
          catalogType: "accesorios",
          materialId: selected.id,
          description: selected.name,
          quantity: catalogQuantity,
          unit: selected.measureType === "centimetro" ? "cm" : "unidad",
          unitPrice: textNumber(selected.unitPrice),
        }),
      );
    }
    setCatalogQuantity("1");
    setWidthCm("");
    setLengthCm("");
  }

  function addCustomMaterial() {
    if (!customDescription.trim()) {
      setFormError("Escribí la descripción del material.");
      return;
    }
    if (toNumber(customQuantity) <= 0) {
      setFormError("La cantidad tiene que ser mayor a cero.");
      return;
    }
    if (toNumber(customPrice) <= 0) {
      setFormError("El precio por unidad tiene que ser mayor a cero.");
      return;
    }
    addLine(
      blankLine({
        kind: "custom",
        description: customDescription.trim(),
        quantity: customQuantity,
        unit: customUnit,
        unitPrice: customPrice,
      }),
    );
    setCustomDescription("");
    setCustomQuantity("");
    setCustomPrice("");
  }

  const catalogPreview = selected
    ? linePreview(
        blankLine({
          kind: "catalog",
          catalogType: selected.type,
          materialId: selected.id,
          description: selected.name,
          quantity: catalogQuantity,
          unit:
            selected.type === "maderas"
              ? "tabla"
              : selected.type === "pinturas"
                ? "gramo"
                : selected.measureType === "centimetro"
                  ? "cm"
                  : "unidad",
          unitPrice: textNumber(
            selected.type === "maderas"
              ? selected.pricePerCm2
              : selected.type === "pinturas"
                ? selected.pricePerGram
                : selected.unitPrice,
          ),
          widthCm,
          lengthCm,
        }),
        materials,
      )
    : 0;

  return (
    <div className="flex flex-col gap-md">
      <input
        type="hidden"
        name="costQuote"
        value={payload ? JSON.stringify(payload) : ""}
      />

      {value.lines.length === 0 ? (
        <p className="py-sm text-sm text-on-surface-variant">
          Todavía no hay materiales en la cotización.
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-sm min-[450px]:hidden">
            {value.lines.map((line) => (
              <li
                key={line.id}
                className="rounded-xl border border-outline-variant/25 p-sm"
              >
                <p className="break-words font-semibold text-on-surface">
                  {line.description}
                </p>
                <dl className="mt-2 flex flex-col gap-1 text-sm">
                  <div className="flex items-start justify-between gap-sm">
                    <dt className="text-on-surface-variant">Cantidad</dt>
                    <dd className="text-right text-on-surface">
                      {quantityLabel(line)}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-sm">
                    <dt className="text-on-surface-variant">Precio</dt>
                    <dd className="font-semibold text-on-surface">
                      {formatProductPrice(amounts.get(line.id) ?? 0)}
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      lines: value.lines.filter((item) => item.id !== line.id),
                    })
                  }
                  className="mt-sm inline-flex min-h-11 items-center text-sm text-on-surface-variant hover:text-error"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
          <div className="hidden min-[450px]:block">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-sm border-b border-outline-variant/30 pb-2 text-xs text-on-surface-variant">
              <span>Material</span>
              <span>Cantidad</span>
              <span className="text-right">Precio</span>
              <span />
            </div>
            <ul>
              {value.lines.map((line) => (
                <li
                  key={line.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-sm border-b border-outline-variant/20 py-2 text-sm"
                >
                  <span className="min-w-0 break-words text-on-surface">
                    {line.description}
                  </span>
                  <span className="text-on-surface-variant">
                    {quantityLabel(line)}
                  </span>
                  <span className="text-right font-semibold text-on-surface">
                    {formatProductPrice(amounts.get(line.id) ?? 0)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        lines: value.lines.filter((item) => item.id !== line.id),
                      })
                    }
                    className="text-xs text-on-surface-variant hover:text-error"
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <section className="flex flex-col gap-sm rounded-xl border border-outline-variant/25 p-sm">
        <h3 className="text-sm font-semibold text-on-surface">
          Agregar material cargado
        </h3>
        <SearchableSelect
          size="sm"
          value={catalogId}
          onChange={(next) => {
            setCatalogId(next);
            setFormError("");
          }}
          placeholder="Elegí un material"
          searchPlaceholder="Buscar material..."
          emptyMessage="No hay materiales cargados"
          options={materials.map((item) => ({
            value: item.id,
            label: `${materialSubcategoryLabels[item.type]} · ${item.name}`,
          }))}
        />
        {selected?.type === "maderas" ? (
          <div className="grid grid-cols-1 gap-sm sm:grid-cols-3">
            <NumberField label="Ancho (cm)" value={widthCm} onChange={setWidthCm} />
            <NumberField label="Largo (cm)" value={lengthCm} onChange={setLengthCm} />
            <NumberField
              label="Cantidad de tablas"
              value={catalogQuantity}
              onChange={setCatalogQuantity}
            />
          </div>
        ) : null}
        {selected?.type === "pinturas" ? (
          <NumberField
            label="Gramos"
            value={catalogQuantity}
            onChange={setCatalogQuantity}
          />
        ) : null}
        {selected?.type === "accesorios" ? (
          <NumberField
            label={
              selected.measureType === "centimetro" ? "Cantidad (cm)" : "Cantidad"
            }
            value={catalogQuantity}
            onChange={setCatalogQuantity}
          />
        ) : null}
        {selected ? (
          <p className="text-xs text-on-surface-variant">
            Precio de este material: {formatProductPrice(catalogPreview)}
          </p>
        ) : (
          <p className="text-xs text-on-surface-variant">
            La madera pide medidas y cantidad de tablas. El resto usa su unidad
            cargada.
          </p>
        )}
        <button
          type="button"
          onClick={addCatalogMaterial}
          className="inline-flex w-fit items-center gap-1 text-sm text-primary hover:underline"
        >
          <MaterialIcon name="add" className="text-sm" />
          Agregar a la cotización
        </button>
      </section>

      <section className="flex flex-col gap-sm rounded-xl border border-outline-variant/25 p-sm">
        <h3 className="text-sm font-semibold text-on-surface">
          Material que no está cargado
        </h3>
        <label className="flex flex-col gap-xs">
          <span className="text-xs text-on-surface-variant">Descripción</span>
          <input
            value={customDescription}
            placeholder="Por ejemplo, máquina"
            onChange={(event) => setCustomDescription(event.target.value)}
            className={fieldClassName}
          />
        </label>
        <div className="grid grid-cols-1 gap-sm sm:grid-cols-3">
          <label className="flex flex-col gap-xs">
            <span className="text-xs text-on-surface-variant">Cantidad</span>
            <div className="flex items-stretch gap-xs">
              <input
                inputMode="decimal"
                value={customQuantity}
                onChange={(event) => setCustomQuantity(event.target.value)}
                className={`${fieldClassName} min-w-0 flex-1`}
              />
              <CalculatorButton
                value={customQuantity}
                prefix=""
                applyLabel="Usar cantidad"
                onApply={setCustomQuantity}
              />
            </div>
          </label>
          <label className="flex flex-col gap-xs">
            <span className="text-xs text-on-surface-variant">Unidad</span>
            <select
              value={customUnit}
              onChange={(event) =>
                setCustomUnit(event.target.value === "minuto" ? "minuto" : "unidad")
              }
              className={fieldClassName}
            >
              <option value="unidad">Unidad</option>
              <option value="minuto">Minuto</option>
            </select>
          </label>
          <label className="flex flex-col gap-xs">
            <span className="text-xs text-on-surface-variant">
              {customUnit === "minuto" ? "Precio por minuto" : "Precio por unidad"}
            </span>
            <div className="flex items-stretch gap-xs">
              <div className="min-w-0 flex-1">
                <MoneyInput value={customPrice} onChange={setCustomPrice} />
              </div>
              <CalculatorButton value={customPrice} onApply={setCustomPrice} />
            </div>
          </label>
        </div>
        {customUnit === "minuto" ? (
          <p className="text-xs text-on-surface-variant">
            El precio es cantidad de minutos por el precio de cada minuto. Si
            tenés un valor por hora, abrí la calculadora y dividilo por 60.
          </p>
        ) : (
          <p className="text-xs text-on-surface-variant">
            El precio es la cantidad multiplicada por el precio de cada unidad.
          </p>
        )}
        <button
          type="button"
          onClick={addCustomMaterial}
          className="inline-flex w-fit items-center gap-1 text-sm text-primary hover:underline"
        >
          <MaterialIcon name="add" className="text-sm" />
          Agregar material libre
        </button>
      </section>

      {formError ? (
        <p className="text-sm text-error" role="alert">
          {formError}
        </p>
      ) : null}

      <p className="border-t border-outline-variant/25 pt-sm font-semibold text-on-surface">
        Costo estimado: {formatProductPrice(payload?.totalAmount ?? 0)}
      </p>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-xs">
      <span className="text-xs text-on-surface-variant">{label}</span>
      <input
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClassName}
      />
    </label>
  );
}
