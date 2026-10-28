"use client";

import { useActionState, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import {
  RowActionLabel,
  RowActionsMenu,
  rowDangerActionClass,
  rowIconActionClass,
} from "@/components/ui/row-actions-menu";
import {
  computeCostPerUnit,
  measureTypeLabels,
  measureTypes,
  measureUnitLabels,
  type MeasureType,
  type Material,
} from "@/types/material";
import {
  deleteMaterialAction,
  saveMaterialAction,
} from "../actions/save-material";
import { formatMoney, formatNumber } from "../lib/format";

type FormState = {
  name: string;
  measureType: MeasureType;
  totalCost: string;
  totalUnits: string;
  sheetWidthCm: string;
  sheetHeightCm: string;
  sheetCount: string;
};

const emptyForm: FormState = {
  name: "",
  measureType: "unit",
  totalCost: "",
  totalUnits: "",
  sheetWidthCm: "",
  sheetHeightCm: "",
  sheetCount: "1",
};

const inputClassName =
  "w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary";

const unitsHint: Record<MeasureType, string> = {
  area_cm2: "cm² totales que rinde (ej: 100 hojas de 21×30 = 63.000)",
  unit: "Cantidad de unidades que trae el pack",
  time_minutes: "Minutos que rinde el pago (ej: 1 hora = 60)",
};

function materialToForm(material: Material): FormState {
  return {
    ...emptyForm,
    name: material.name,
    measureType: material.measureType,
    totalCost: String(material.totalCost),
    totalUnits: String(material.totalUnits),
  };
}

export function MaterialManager({ materials: initialList }: { materials: Material[] }) {
  const [materials, setMaterials] = useState(initialList);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [query, setQuery] = useState("");

  const [state, action, pending] = useActionState(saveMaterialAction, null);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteMaterialAction,
    null,
  );
  const [prevState, setPrevState] = useState(state);
  const [prevDeleteState, setPrevDeleteState] = useState(deleteState);

  if (state !== prevState) {
    setPrevState(state);
    const saved = state?.material;
    if (saved) {
      setMaterials((prev) => {
        const next = prev.some((item) => item.id === saved.id)
          ? prev.map((item) => (item.id === saved.id ? saved : item))
          : [...prev, saved];
        return next.sort((a, b) => a.name.localeCompare(b.name, "es"));
      });
      setEditingId(null);
      setForm(emptyForm);
    }
  }

  if (deleteState !== prevDeleteState) {
    setPrevDeleteState(deleteState);
    const deletedId = deleteState?.deletedId;
    if (deletedId) {
      setMaterials((prev) => prev.filter((item) => item.id !== deletedId));
      if (editingId === deletedId) {
        setEditingId(null);
        setForm(emptyForm);
      }
    }
  }

  const costPerUnit = computeCostPerUnit(
    Number(form.totalCost) || 0,
    Number(form.totalUnits) || 0,
  );

  const sheetArea =
    (Number(form.sheetWidthCm) || 0) *
    (Number(form.sheetHeightCm) || 0) *
    (Number(form.sheetCount) || 0);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return materials;
    return materials.filter((item) => item.name.toLowerCase().includes(term));
  }, [materials, query]);

  function patch(next: Partial<FormState>) {
    setForm((current) => ({ ...current, ...next }));
  }

  function startEdit(material: Material) {
    setEditingId(material.id);
    setForm(materialToForm(material));
  }

  function reset() {
    setEditingId(null);
    setForm(emptyForm);
  }

  const error = state?.error ?? deleteState?.error;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-lg">
      <article className="rounded-2xl border border-outline-variant/20 bg-surface-container p-lg h-fit">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">
          {editingId ? "Editar material" : "Nuevo material"}
        </h2>
        <p className="text-sm text-on-surface-variant mb-md">
          Cargá lo que pagaste por el pack o plancha y cuánto rinde. El costo por
          unidad se calcula solo.
        </p>

        <form action={action} className="flex flex-col gap-sm">
          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error"
            >
              {error}
            </div>
          ) : null}

          {editingId ? <input type="hidden" name="id" value={editingId} /> : null}

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">Nombre</span>
            <input
              name="name"
              value={form.name}
              onChange={(event) => patch({ name: event.target.value })}
              placeholder="Ej: Madera MDF 3 mm"
              required
              className={inputClassName}
            />
          </label>

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">Se mide en</span>
            <select
              name="measureType"
              value={form.measureType}
              onChange={(event) =>
                patch({ measureType: event.target.value as MeasureType })
              }
              className={inputClassName}
            >
              {measureTypes.map((type) => (
                <option key={type} value={type}>
                  {measureTypeLabels[type]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">
              Costo total (lo que pagaste)
            </span>
            <input
              name="totalCost"
              type="number"
              min="0"
              step="0.01"
              value={form.totalCost}
              onChange={(event) => patch({ totalCost: event.target.value })}
              required
              className={inputClassName}
            />
          </label>

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">
              Unidades totales ({measureUnitLabels[form.measureType]})
            </span>
            <input
              name="totalUnits"
              type="number"
              min="0"
              step="any"
              value={form.totalUnits}
              onChange={(event) => patch({ totalUnits: event.target.value })}
              required
              className={inputClassName}
            />
            <span className="text-xs text-on-surface-variant">
              {unitsHint[form.measureType]}
            </span>
          </label>

          {form.measureType === "area_cm2" ? (
            <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-sm flex flex-col gap-sm">
              <p className="text-xs text-on-surface-variant">
                Calculadora: medidas de cada hoja/plancha × cantidad
              </p>
              <div className="grid grid-cols-3 gap-sm">
                {(
                  [
                    ["sheetWidthCm", "Ancho (cm)"],
                    ["sheetHeightCm", "Alto (cm)"],
                    ["sheetCount", "Cantidad"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex flex-col gap-xs">
                    <span className="text-xs text-on-surface-variant">{label}</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form[key]}
                      onChange={(event) => patch({ [key]: event.target.value })}
                      className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-on-surface"
                    />
                  </label>
                ))}
              </div>
              <button
                type="button"
                disabled={sheetArea <= 0}
                onClick={() => patch({ totalUnits: String(sheetArea) })}
                className="self-start text-sm text-primary disabled:opacity-40"
              >
                Usar {formatNumber(sheetArea)} cm² como unidades totales
              </button>
            </div>
          ) : null}

          <div className="rounded-xl bg-surface-container-high px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-on-surface-variant">
              Costo por {measureUnitLabels[form.measureType]}
            </span>
            <span className="font-semibold text-on-surface">
              {formatMoney(costPerUnit, 4)}
            </span>
          </div>

          <div className="flex gap-sm mt-sm">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-lg bg-primary-container px-6 py-3 text-white font-label-caps text-label-caps tracking-widest uppercase hover:bg-secondary-container transition-colors disabled:opacity-50"
            >
              {pending
                ? "Guardando..."
                : editingId
                  ? "Guardar cambios"
                  : "Agregar material"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-outline-variant/40 px-4 py-3 text-on-surface-variant font-label-caps text-label-caps tracking-widest uppercase hover:bg-surface-container-high transition-colors"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      </article>

      <article className="rounded-2xl border border-outline-variant/20 bg-surface-container p-lg">
        <div className="flex flex-wrap items-center justify-between gap-sm mb-sm">
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Materiales
            <span className="ml-sm text-sm text-on-surface-variant">
              {materials.length}
            </span>
          </h3>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar..."
            aria-label="Buscar materiales"
            className="rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
          />
        </div>

        {visible.length === 0 ? (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-lg text-center text-on-surface-variant">
            {materials.length === 0
              ? "Todavía no hay materiales. Cargalos con el formulario o con npm run seed:materials."
              : "Ningún material coincide con la búsqueda."}
          </div>
        ) : (
          <ul className="flex flex-col">
            {visible.map((material) => (
              <li
                key={material.id}
                className={
                  material.id === editingId
                    ? "relative flex flex-col gap-xs border-b border-outline-variant/10 bg-primary/10 py-sm pr-10 sm:flex-row sm:items-center sm:justify-between sm:gap-sm sm:pr-0"
                    : "relative flex flex-col gap-xs border-b border-outline-variant/10 py-sm pr-10 sm:flex-row sm:items-center sm:justify-between sm:gap-sm sm:pr-0"
                }
              >
                <div className="min-w-0 sm:flex-1">
                  <p className="text-on-surface">{material.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {measureTypeLabels[material.measureType]}
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-md gap-y-xs text-sm sm:justify-end">
                  <span className="whitespace-nowrap">
                    {formatMoney(material.totalCost)}
                  </span>
                  <span className="whitespace-nowrap text-on-surface-variant">
                    rinde {formatNumber(material.totalUnits)}{" "}
                    {measureUnitLabels[material.measureType]}
                  </span>
                  <span className="whitespace-nowrap font-semibold">
                    {formatMoney(material.costPerUnit, 4)} /{" "}
                    {measureUnitLabels[material.measureType]}
                  </span>
                </div>
                <RowActionsMenu
                  label={`Acciones de ${material.name}`}
                  className="absolute right-0 top-1 sm:static"
                >
                  <button
                    type="button"
                    onClick={() => startEdit(material)}
                    className={rowIconActionClass}
                    aria-label={`Editar ${material.name}`}
                    title="Editar"
                  >
                    <MaterialIcon name="edit" className="text-base" />
                    <RowActionLabel>Editar</RowActionLabel>
                  </button>
                  <form
                    action={deleteAction}
                    className="w-full sm:w-auto"
                    onSubmit={(event) => {
                      if (!window.confirm(`¿Eliminar "${material.name}"?`)) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="id" value={material.id} />
                    <button
                      type="submit"
                      disabled={deletePending}
                      className={rowDangerActionClass}
                      aria-label={`Eliminar ${material.name}`}
                      title="Eliminar"
                    >
                      <MaterialIcon name="delete" className="text-base" />
                      <RowActionLabel>Eliminar</RowActionLabel>
                    </button>
                  </form>
                </RowActionsMenu>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
