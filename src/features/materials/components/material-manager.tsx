"use client";

import {
  useActionState,
  useEffect,
  useId,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { MaterialIcon } from "@/components/ui/material-icon";
import {
  RowActionLabel,
  RowActionsMenu,
  rowDangerActionClass,
  rowIconActionClass,
} from "@/components/ui/row-actions-menu";
import {
  computeCostPerUnit,
  defaultWorkArea,
  materialSheetBases,
  materialCategories,
  materialCategoryLabels,
  measureTypeLabels,
  measureTypes,
  measureUnitLabels,
  type MaterialCategory,
  type MeasureType,
  type Material,
} from "@/types/material";
import {
  deleteMaterialAction,
  saveMaterialAction,
} from "../actions/save-material";
import { formatEditedAt, formatMoney, formatNumber } from "../lib/format";

type FormState = {
  name: string;
  measureType: MeasureType;
  category: MaterialCategory;
  totalCost: string;
  totalUnits: string;
  sheetWidthCm: string;
  sheetHeightCm: string;
  sheetCount: string;
  useWorkArea: boolean;
  workWidthCm: string;
  workHeightCm: string;
};

const emptyForm: FormState = {
  name: "",
  measureType: "unit",
  category: "other",
  totalCost: "",
  totalUnits: "",
  sheetWidthCm: "",
  sheetHeightCm: "",
  sheetCount: "1",
  useWorkArea: false,
  workWidthCm: String(defaultWorkArea.widthCm),
  workHeightCm: String(defaultWorkArea.heightCm),
};

const inputClassName =
  "w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary";

const unitsHint: Record<MeasureType, string> = {
  area_cm2: "cm² totales que rinde (ej: 100 hojas de 21×30 = 63.000)",
  unit: "Cantidad de unidades que trae el pack",
  time_minutes: "Minutos que rinde el pago (ej: 1 hora = 60)",
};

/** Para madera/papel: cuántas placas/hojas son y a cuánto salió cada una. */
function sheetFieldsFromMaterial(material: Material) {
  const base =
    material.measureType === "area_cm2" && material.category
      ? materialSheetBases[material.category]
      : undefined;
  if (!base) return {};
  const count = material.totalUnits / (base.widthCm * base.heightCm);
  if (!(count > 0)) return {};
  const round = (value: number, digits: number) =>
    String(Number(value.toFixed(digits)));
  return { sheetCount: round(count, 4) };
}

function materialToForm(material: Material): FormState {
  return {
    ...emptyForm,
    name: material.name,
    measureType: material.measureType,
    category: material.category ?? "other",
    totalCost: String(material.totalCost),
    totalUnits: String(material.totalUnits),
    ...sheetFieldsFromMaterial(material),
    useWorkArea: Boolean(material.workArea),
    workWidthCm: String(material.workArea?.widthCm ?? defaultWorkArea.widthCm),
    workHeightCm: String(material.workArea?.heightCm ?? defaultWorkArea.heightCm),
  };
}

export function MaterialManager({ materials: initialList }: { materials: Material[] }) {
  const [materials, setMaterials] = useState(initialList);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const titleId = useId();
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [state, action, pending] = useActionState(saveMaterialAction, null);
  // El error del servidor es de un envío puntual: al reabrir el formulario no debe reaparecer.
  const [dismissedState, setDismissedState] = useState(state);
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
      setNotice(`Guardado: ${saved.name}`);
      setIsOpen(false);
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
        setIsOpen(false);
        setEditingId(null);
        setForm(emptyForm);
      }
    }
  }

  const sheetBase =
    form.measureType === "area_cm2" ? materialSheetBases[form.category] : undefined;

  // Madera y papel se compran por placa/hoja: precio × cantidad, y los cm² salen de la medida base.
  const sheetCountValue = Number(form.sheetCount) || 0;
  const effectiveTotalCost = Number(form.totalCost) || 0;
  const effectiveTotalUnits = sheetBase
    ? sheetCountValue * sheetBase.widthCm * sheetBase.heightCm
    : Number(form.totalUnits) || 0;

  const costPerUnit = computeCostPerUnit(effectiveTotalCost, effectiveTotalUnits);

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

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDismissedState(state);
    setIsOpen(true);
  }

  function startEdit(material: Material) {
    setEditingId(material.id);
    setForm(materialToForm(material));
    setDismissedState(state);
    setIsOpen(true);
  }

  function reset() {
    setIsOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function renderActions(material: Material, className: string) {
    return (
      <RowActionsMenu label={`Acciones de ${material.name}`} className={className}>
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
    );
  }

  const serverError = state === dismissedState ? undefined : state?.error;

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setIsOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    }
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey, true);
    };
  }, [isOpen]);

  return (
    <section>
      <article className="rounded-2xl border border-outline-variant/20 bg-surface-container p-lg">
        <div className="flex flex-wrap items-center justify-between gap-sm mb-sm">
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Materiales ({materials.length})
          </h3>
          <div className="flex flex-wrap items-center gap-sm">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar..."
              aria-label="Buscar materiales"
              className="rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary-container px-4 py-3 text-white font-label-caps text-label-caps tracking-widest uppercase hover:bg-secondary-container transition-colors"
            >
              <MaterialIcon
                name="add"
                className="text-base leading-none normal-case tracking-normal"
              />
              Nuevo material
            </button>
          </div>
        </div>

        {notice && !isOpen ? (
          <div
            role="status"
            className="mb-sm rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-on-surface"
          >
            {notice}
          </div>
        ) : null}
        {deleteState?.error ? (
          <div
            role="alert"
            className="mb-sm rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error"
          >
            {deleteState.error}
          </div>
        ) : null}

        {visible.length === 0 ? (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-lg text-center text-on-surface-variant">
            {materials.length === 0
              ? "Todavía no hay materiales. Cargalos con el botón Nuevo material."
              : "Ningún material coincide con la búsqueda."}
          </div>
        ) : (
          <>
          {/* Mobile: una tarjeta por material, sin scroll horizontal. */}
          <ul className="flex flex-col gap-sm sm:hidden">
            {visible.map((material) => {
              const unit = measureUnitLabels[material.measureType];
              const base =
                material.measureType === "area_cm2" && material.category
                  ? materialSheetBases[material.category]
                  : undefined;

              return (
                <li
                  key={material.id}
                  className="relative rounded-xl border border-outline-variant/20 bg-surface-container-low p-sm"
                >
                  <div className="pr-10">
                    <p className="font-headline-md text-on-surface wrap-break-word">
                      {material.name}
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      Por {unit}:{" "}
                      <span className="font-semibold text-on-surface">
                        {formatMoney(material.costPerUnit, 4)}
                      </span>
                    </p>
                    {base ? (
                      <p className="mt-1 text-sm text-on-surface-variant">
                        Por {base.unit}:{" "}
                        <span className="font-semibold text-on-surface">
                          {formatMoney(
                            material.costPerUnit * base.widthCm * base.heightCm,
                            2,
                          )}
                        </span>
                      </p>
                    ) : null}
                    <p className="mt-1 text-sm text-on-surface-variant">
                      Última edición: {formatEditedAt(material.updatedAt)}
                    </p>
                  </div>
                  {renderActions(material, "absolute right-2 top-2")}
                </li>
              );
            })}
          </ul>

          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-on-surface-variant border-b border-outline-variant/30">
                  <th className="py-2 pr-2">Nombre</th>
                  <th className="py-2 pr-2">Tipo</th>
                  <th className="py-2 pr-2">Costo</th>
                  <th className="py-2 pr-2">Rinde</th>
                  <th className="py-2 pr-2">Por unidad</th>
                  <th className="py-2 pr-2">Por placa/hoja</th>
                  <th className="py-2 pr-2">Última edición</th>
                  <th className="py-2"> </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((material) => {
                  const unit = measureUnitLabels[material.measureType];
                  const base =
                    material.measureType === "area_cm2" && material.category
                      ? materialSheetBases[material.category]
                      : undefined;

                  return (
                    <tr
                      key={material.id}
                      className="border-b border-outline-variant/10"
                    >
                      <td className="py-2 pr-2">{material.name}</td>
                      <td className="py-2 pr-2 text-on-surface-variant">
                        {measureTypeLabels[material.measureType]}
                        {material.category && material.category !== "other"
                          ? ` · ${materialCategoryLabels[material.category]}`
                          : ""}
                        {material.workArea
                          ? ` · útil ${material.workArea.widthCm}×${material.workArea.heightCm}`
                          : ""}
                      </td>
                      <td className="py-2 pr-2 whitespace-nowrap">
                        {formatMoney(material.totalCost)}
                      </td>
                      <td className="py-2 pr-2 whitespace-nowrap text-on-surface-variant">
                        {formatNumber(material.totalUnits)} {unit}
                      </td>
                      <td className="py-2 pr-2 whitespace-nowrap font-semibold">
                        {formatMoney(material.costPerUnit, 4)} / {unit}
                      </td>
                      <td className="py-2 pr-2 whitespace-nowrap font-semibold">
                        {base
                          ? `${formatMoney(
                              material.costPerUnit * base.widthCm * base.heightCm,
                              2,
                            )} / ${base.unit}`
                          : "—"}
                      </td>
                      <td className="py-2 pr-2 whitespace-nowrap text-on-surface-variant">
                        {formatEditedAt(material.updatedAt)}
                      </td>
                      <td className="py-2">
                        {renderActions(material, "relative flex justify-end")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </article>

      {isOpen && isClient
        ? createPortal(
            <div className="fixed inset-0 z-[2147483646] flex h-dvh w-screen items-start justify-center overflow-y-auto bg-black/80 px-4 py-6">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="my-auto box-border w-full max-w-160 rounded-2xl border border-outline-variant/30 bg-surface-container p-6"
              >
                <div className="mb-sm flex items-start justify-between gap-sm">
                  <h2
                    id={titleId}
                    className="font-headline-md text-headline-md text-on-surface"
                  >
                    {editingId ? "Editar material" : "Nuevo material"}
                  </h2>
                  <button
                    type="button"
                    aria-label="Cerrar"
                    onClick={reset}
                    className="touch-target inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                  >
                    <MaterialIcon name="close" />
                  </button>
                </div>
                <p className="text-sm text-on-surface-variant mb-md">
                  Cargá lo que pagaste por el pack o plancha y cuánto rinde. El
                  costo por unidad se calcula solo.
                </p>

                <form action={action} className="flex flex-col gap-sm">
                  {serverError ? (
                    <div
                      role="alert"
                      className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error"
                    >
                      {serverError}
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
                    <span className="text-sm text-on-surface-variant">Tipo de material</span>
                    <select
                      name="category"
                      value={form.category}
                      onChange={(event) =>
                        patch({ category: event.target.value as MaterialCategory })
                      }
                      className={inputClassName}
                    >
                      {materialCategories.map((category) => (
                        <option key={category} value={category}>
                          {materialCategoryLabels[category]}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-on-surface-variant">
                      Madera usa placa de 30×30 y papel hoja de 21×30 en el cotizador.
                    </span>
                  </label>

                  {sheetBase ? (
                    <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-sm flex flex-col gap-sm">
                      <label className="inline-flex items-center gap-xs">
                        <input
                          type="checkbox"
                          name="useWorkArea"
                          checked={form.useWorkArea}
                          onChange={(event) => patch({ useWorkArea: event.target.checked })}
                        />
                        <span className="text-sm text-on-surface">
                          Definir espacio de trabajo
                        </span>
                      </label>
                      <p className="text-xs text-on-surface-variant">
                        {sheetBase.label} ({sheetBase.widthCm}×{sheetBase.heightCm} cm). Si dejás
                        márgenes (ej: para que la impresora no falle), cargá la zona útil: el
                        cotizador calcula cuántas piezas entran ahí y suma el sobrante como
                        pérdida en cada unidad.
                      </p>
                      {form.useWorkArea ? (
                        <div className="grid grid-cols-2 gap-sm">
                          {(
                            [
                              ["workWidthCm", "Ancho útil (cm)"],
                              ["workHeightCm", "Alto útil (cm)"],
                            ] as const
                          ).map(([key, label]) => (
                            <label key={key} className="flex flex-col gap-xs">
                              <span className="text-xs text-on-surface-variant">{label}</span>
                              <input
                                name={key}
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
                      ) : null}
                    </div>
                  ) : null}

                  {sheetBase ? (
                    <>
                      <input type="hidden" name="totalUnits" value={effectiveTotalUnits} />
                      <div className="grid grid-cols-2 gap-sm">
                        <label className="flex flex-col gap-xs">
                          <span className="text-sm text-on-surface-variant">
                            Precio total (lo que pagaste)
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
                            Cantidad de {sheetBase.unit}s que vienen
                          </span>
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={form.sheetCount}
                            onChange={(event) => patch({ sheetCount: event.target.value })}
                            required
                            className={inputClassName}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-on-surface-variant">
                        {sheetBase.label}: {formatNumber(effectiveTotalUnits)} cm² en
                        total ({formatNumber(sheetBase.widthCm * sheetBase.heightCm)} cm²
                        por {sheetBase.unit}).
                      </p>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}

                  {form.measureType === "area_cm2" && !sheetBase ? (
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

                  {sheetBase ? (
                    <div className="rounded-xl bg-surface-container-high px-4 py-3 flex items-center justify-between">
                      <span className="text-sm text-on-surface-variant">
                        Costo por {sheetBase.unit} ({sheetBase.widthCm}×{sheetBase.heightCm})
                      </span>
                      <span className="font-semibold text-on-surface">
                        {formatMoney(costPerUnit * sheetBase.widthCm * sheetBase.heightCm, 2)}
                      </span>
                    </div>
                  ) : null}

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
                    {true ? (
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
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
