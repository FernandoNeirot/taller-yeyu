"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { MoneyInput, moneyToNumber } from "@/components/ui/money-input";
import { CalculatorButton } from "@/components/ui/price-calculator";
import { saveVentureEntryAction } from "@/features/finance/actions/save-venture-entry";
import {
  getPaymentStatus,
  materialSubcategories,
  materialSubcategoryLabels,
  ventureCategories,
  type AccessoryMeasureType,
  type MaterialSubcategory,
  type MovementType,
  type VentureFinanceEntry,
} from "@/features/finance/types";

type FormState = {
  date: string;
  category: string;
  subcategory: string;
  description: string;
  movementType: MovementType;
  totalAmount: string;
  paidAmount: string;
  isPaid: boolean;
};

type WoodRow = {
  id: string;
  name: string;
  widthCm: string;
  lengthCm: string;
  price: string;
};

type PaintRow = {
  id: string;
  color: string;
  quantity: string;
  weightGrams: string;
};

type AccessoryRow = {
  id: string;
  name: string;
  measureType: AccessoryMeasureType;
  quantity: string;
  totalPrice: string;
};

function getTodayDate() {
  return new Date().toLocaleDateString("en-CA");
}

function emptyForm(): FormState {
  return {
    date: getTodayDate(),
    category: "",
    subcategory: "",
    description: "",
    movementType: "egreso",
    totalAmount: "",
    paidAmount: "",
    isPaid: false,
  };
}

function amountToRaw(value: number) {
  if (!value) return "";
  return String(value);
}

function newId() {
  return crypto.randomUUID();
}

function emptyWood(): WoodRow {
  return { id: newId(), name: "", widthCm: "", lengthCm: "", price: "" };
}

function emptyPaint(): PaintRow {
  return { id: newId(), color: "", quantity: "1", weightGrams: "" };
}

function emptyAccessory(): AccessoryRow {
  return {
    id: newId(),
    name: "",
    measureType: "unidad",
    quantity: "1",
    totalPrice: "",
  };
}

function formatTableDate(date: string) {
  const [, month, day] = date.split("-");
  if (!day || !month) return date;
  return `${day}-${month}`;
}

function settlementLabel(
  movementType: MovementType,
  totalAmount: number,
  paidAmount: number,
  isPaid: boolean,
) {
  const status = getPaymentStatus(totalAmount, paidAmount, isPaid);
  if (status === "pagado") {
    return movementType === "ingreso" ? "Cobrado" : "Pagado";
  }
  if (status === "parcial") return "Parcial";
  return "Pendiente";
}

function SettlementStatusIcon({
  movementType,
  totalAmount,
  paidAmount,
  isPaid,
}: {
  movementType: MovementType;
  totalAmount: number;
  paidAmount: number;
  isPaid: boolean;
}) {
  const paid = getPaymentStatus(totalAmount, paidAmount, isPaid) === "pagado";
  const label = settlementLabel(movementType, totalAmount, paidAmount, isPaid);

  return (
    <span
      className={paid ? "text-green-500" : "text-orange-500"}
      title={label}
      aria-label={label}
    >
      <MaterialIcon
        name={paid ? "check_circle" : "schedule"}
        filled
        className="text-lg"
      />
    </span>
  );
}

export function VentureFinancePanel({
  entries: initialEntries,
}: {
  entries: VentureFinanceEntry[];
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [entries, setEntries] = useState(initialEntries);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [woodRows, setWoodRows] = useState<WoodRow[]>([emptyWood()]);
  const [paintRows, setPaintRows] = useState<PaintRow[]>([emptyPaint()]);
  const [accessoryRows, setAccessoryRows] = useState<AccessoryRow[]>([
    emptyAccessory(),
  ]);
  const [state, action, pending] = useActionState(saveVentureEntryAction, null);

  const isMaterials = form.category === "Materiales";
  const subcategory = form.subcategory as MaterialSubcategory | "";

  useEffect(() => {
    const saved = state?.entry;
    if (!saved) return;

    setEntries((prev) => {
      const exists = prev.some((entry) => entry.id === saved.id);
      if (exists) {
        return prev.map((entry) => (entry.id === saved.id ? saved : entry));
      }
      return [saved, ...prev];
    });
    resetForm();
  }, [state]);

  function resetForm() {
    setForm(emptyForm());
    setEditingId(null);
    setWoodRows([emptyWood()]);
    setPaintRows([emptyPaint()]);
    setAccessoryRows([emptyAccessory()]);
  }

  function startEdit(entry: VentureFinanceEntry) {
    setEditingId(entry.id);
    setForm({
      date: entry.date,
      category: entry.category,
      subcategory: entry.subcategory,
      description: entry.description,
      movementType: entry.movementType,
      totalAmount: amountToRaw(entry.totalAmount),
      paidAmount: amountToRaw(entry.paidAmount),
      isPaid: entry.isPaid,
    });
  }

  const totals = useMemo(() => {
    const ingresos = entries
      .filter((entry) => entry.movementType === "ingreso")
      .reduce((acc, entry) => acc + entry.totalAmount, 0);
    const egresos = entries
      .filter((entry) => entry.movementType === "egreso")
      .reduce((acc, entry) => acc + entry.totalAmount, 0);
    return { ingresos, egresos, balance: ingresos - egresos };
  }, [entries]);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-lg">
      <article className="rounded-2xl border border-outline-variant/20 bg-surface-container p-lg">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">
          {editingId ? "Editar movimiento" : "Carga de emprendimiento"}
        </h2>

        <form action={action} className="flex flex-col gap-sm">
          {state?.error ? (
            <div className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
              {state.error}
            </div>
          ) : null}

          {editingId ? <input type="hidden" name="id" value={editingId} /> : null}

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">Fecha</span>
            <input
              name="date"
              type="date"
              required
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
            />
          </label>

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">Categoría</span>
            <select
              name="category"
              required
              value={form.category}
              onChange={(event) =>
                setForm({
                  ...form,
                  category: event.target.value,
                  subcategory:
                    event.target.value === "Materiales" ? form.subcategory : "",
                  movementType:
                    event.target.value === "Ventas" ? "ingreso" : form.movementType,
                })
              }
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
            >
              <option value="">Seleccioná una categoría</option>
              {ventureCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          {isMaterials ? (
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">
                Subcategoría de material
              </span>
              <select
                name="subcategory"
                required
                value={form.subcategory}
                onChange={(event) =>
                  setForm({ ...form, subcategory: event.target.value })
                }
                className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
              >
                <option value="">Seleccioná</option>
                {materialSubcategories.map((item) => (
                  <option key={item} value={item}>
                    {materialSubcategoryLabels[item]}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <input type="hidden" name="subcategory" value="" />
          )}

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">Descripción</span>
            <textarea
              name="description"
              required
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="Detalle de la compra o movimiento"
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
            />
          </label>

          <div className="flex gap-md">
            <label className="inline-flex items-center gap-xs">
              <input
                type="radio"
                name="movementType"
                value="ingreso"
                checked={form.movementType === "ingreso"}
                onChange={() => setForm({ ...form, movementType: "ingreso" })}
              />
              <span className="text-on-surface">Ingreso</span>
            </label>
            <label className="inline-flex items-center gap-xs">
              <input
                type="radio"
                name="movementType"
                value="egreso"
                checked={form.movementType === "egreso"}
                onChange={() => setForm({ ...form, movementType: "egreso" })}
              />
              <span className="text-on-surface">Egreso</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">Monto total</span>
              <div className="flex gap-sm">
                <div className="flex-1">
                  <MoneyInput
                    name="totalAmount"
                    value={form.totalAmount}
                    onChange={(value) => setForm({ ...form, totalAmount: value })}
                    required
                  />
                </div>
                {isMaterials ? (
                  <CalculatorButton
                    value={form.totalAmount}
                    onApply={(value) => setForm({ ...form, totalAmount: value })}
                  />
                ) : null}
              </div>
            </label>
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">
                {form.movementType === "ingreso"
                  ? "Monto cobrado"
                  : "Monto pagado"}
              </span>
              <MoneyInput
                name="paidAmount"
                value={form.paidAmount}
                onChange={(value) => setForm({ ...form, paidAmount: value })}
              />
            </label>
          </div>

          <label className="inline-flex items-center gap-xs">
            <input
              name="isPaid"
              type="checkbox"
              checked={form.isPaid}
              onChange={(event) =>
                setForm({ ...form, isPaid: event.target.checked })
              }
            />
            <span className="text-on-surface">
              {form.movementType === "ingreso"
                ? "Ya está cobrado"
                : "Ya está pagado"}
            </span>
          </label>

          {isMaterials && subcategory === "maderas" && !editingId ? (
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-sm flex flex-col gap-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">
                  Maderas (nombre, ancho, largo y precio)
                </p>
                <button
                  type="button"
                  onClick={() => setWoodRows((prev) => [...prev, emptyWood()])}
                  className="text-sm text-primary"
                >
                  + Agregar
                </button>
              </div>
              {woodRows.map((row, index) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-sm rounded-lg border border-outline-variant/20 p-sm"
                >
                  <label className="flex flex-col gap-xs sm:col-span-2">
                    <span className="text-xs text-on-surface-variant">
                      Nombre / identificador
                    </span>
                    <input
                      value={row.name}
                      onChange={(event) =>
                        setWoodRows((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, name: event.target.value }
                              : item,
                          ),
                        )
                      }
                      placeholder="Ej: Fibrofacil 3 mm con blanco"
                      className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-on-surface"
                    />
                  </label>
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
                        setWoodRows((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, widthCm: event.target.value }
                              : item,
                          ),
                        )
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
                        setWoodRows((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, lengthCm: event.target.value }
                              : item,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-on-surface"
                    />
                  </label>
                  <label className="flex flex-col gap-xs sm:col-span-2">
                    <span className="text-xs text-on-surface-variant">Precio</span>
                    <div className="flex gap-sm">
                      <div className="flex-1">
                        <MoneyInput
                          value={row.price}
                          onChange={(value) =>
                            setWoodRows((prev) =>
                              prev.map((item) =>
                                item.id === row.id ? { ...item, price: value } : item,
                              ),
                            )
                          }
                        />
                      </div>
                      <CalculatorButton
                        value={row.price}
                        onApply={(value) =>
                          setWoodRows((prev) =>
                            prev.map((item) =>
                              item.id === row.id ? { ...item, price: value } : item,
                            ),
                          )
                        }
                      />
                    </div>
                  </label>
                  {woodRows.length > 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setWoodRows((prev) =>
                          prev.filter((item) => item.id !== row.id),
                        )
                      }
                      className="text-sm text-error sm:col-span-2 text-left"
                    >
                      Quitar fila {index + 1}
                    </button>
                  ) : null}
                </div>
              ))}
              <input
                type="hidden"
                name="woodItems"
                value={JSON.stringify(
                  woodRows.map((row) => ({
                    name: row.name,
                    widthCm: Number(row.widthCm),
                    lengthCm: Number(row.lengthCm),
                    price: moneyToNumber(row.price),
                  })),
                )}
              />
            </div>
          ) : null}

          {isMaterials && subcategory === "pinturas" && !editingId ? (
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-sm flex flex-col gap-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">
                  Carga masiva de pinturas (cantidad, peso y color)
                </p>
                <button
                  type="button"
                  onClick={() => setPaintRows((prev) => [...prev, emptyPaint()])}
                  className="text-sm text-primary"
                >
                  + Agregar color
                </button>
              </div>
              {paintRows.map((row, index) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-sm rounded-lg border border-outline-variant/20 p-sm"
                >
                  <label className="flex flex-col gap-xs">
                    <span className="text-xs text-on-surface-variant">Color</span>
                    <input
                      value={row.color}
                      onChange={(event) =>
                        setPaintRows((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, color: event.target.value }
                              : item,
                          ),
                        )
                      }
                      placeholder="Rojo"
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
                      value={row.quantity}
                      onChange={(event) =>
                        setPaintRows((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, quantity: event.target.value }
                              : item,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-on-surface"
                    />
                  </label>
                  <label className="flex flex-col gap-xs">
                    <span className="text-xs text-on-surface-variant">
                      Peso (g)
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.weightGrams}
                      onChange={(event) =>
                        setPaintRows((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, weightGrams: event.target.value }
                              : item,
                          ),
                        )
                      }
                      placeholder="200"
                      className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-on-surface"
                    />
                  </label>
                  {paintRows.length > 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setPaintRows((prev) =>
                          prev.filter((item) => item.id !== row.id),
                        )
                      }
                      className="text-sm text-error sm:col-span-3 text-left"
                    >
                      Quitar color {index + 1}
                    </button>
                  ) : null}
                </div>
              ))}
              <input
                type="hidden"
                name="paintItems"
                value={JSON.stringify(
                  paintRows.map((row) => ({
                    color: row.color,
                    quantity: Number(row.quantity),
                    weightGrams: Number(row.weightGrams),
                  })),
                )}
              />
            </div>
          ) : null}

          {isMaterials && subcategory === "accesorios" && !editingId ? (
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-sm flex flex-col gap-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">
                  Accesorios (unidad o centímetros)
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setAccessoryRows((prev) => [...prev, emptyAccessory()])
                  }
                  className="text-sm text-primary"
                >
                  + Agregar
                </button>
              </div>
              {accessoryRows.map((row, index) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-sm rounded-lg border border-outline-variant/20 p-sm"
                >
                  <label className="flex flex-col gap-xs sm:col-span-2">
                    <span className="text-xs text-on-surface-variant">Nombre</span>
                    <input
                      value={row.name}
                      onChange={(event) =>
                        setAccessoryRows((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, name: event.target.value }
                              : item,
                          ),
                        )
                      }
                      placeholder="Tornillos / cinta / bisagras..."
                      className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-on-surface"
                    />
                  </label>
                  <label className="flex flex-col gap-xs">
                    <span className="text-xs text-on-surface-variant">Medida</span>
                    <select
                      value={row.measureType}
                      onChange={(event) =>
                        setAccessoryRows((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? {
                                  ...item,
                                  measureType: event.target
                                    .value as AccessoryMeasureType,
                                }
                              : item,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-on-surface"
                    >
                      <option value="unidad">Unidades</option>
                      <option value="centimetro">Centímetros</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-xs">
                    <span className="text-xs text-on-surface-variant">
                      Cantidad
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.quantity}
                      onChange={(event) =>
                        setAccessoryRows((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, quantity: event.target.value }
                              : item,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-on-surface"
                    />
                  </label>
                  <label className="flex flex-col gap-xs sm:col-span-2">
                    <span className="text-xs text-on-surface-variant">
                      Precio total
                    </span>
                    <div className="flex gap-sm">
                      <div className="flex-1">
                        <MoneyInput
                          value={row.totalPrice}
                          onChange={(value) =>
                            setAccessoryRows((prev) =>
                              prev.map((item) =>
                                item.id === row.id
                                  ? { ...item, totalPrice: value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </div>
                      <CalculatorButton
                        value={row.totalPrice}
                        onApply={(value) =>
                          setAccessoryRows((prev) =>
                            prev.map((item) =>
                              item.id === row.id
                                ? { ...item, totalPrice: value }
                                : item,
                            ),
                          )
                        }
                      />
                    </div>
                  </label>
                  {accessoryRows.length > 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setAccessoryRows((prev) =>
                          prev.filter((item) => item.id !== row.id),
                        )
                      }
                      className="text-sm text-error sm:col-span-2 text-left"
                    >
                      Quitar accesorio {index + 1}
                    </button>
                  ) : null}
                </div>
              ))}
              <input
                type="hidden"
                name="accessoryItems"
                value={JSON.stringify(
                  accessoryRows.map((row) => ({
                    name: row.name,
                    measureType: row.measureType,
                    quantity: Number(row.quantity),
                    totalPrice: moneyToNumber(row.totalPrice),
                  })),
                )}
              />
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
                  : "Guardar movimiento"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-outline-variant/40 px-4 py-3 text-on-surface-variant font-label-caps text-label-caps tracking-widest uppercase"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      </article>

      <article className="rounded-2xl border border-outline-variant/20 bg-surface-container p-lg">
        <div className="grid grid-cols-3 gap-sm mb-md">
          <div className="rounded-xl bg-surface-container-high p-sm">
            <p className="text-xs text-on-surface-variant">Ingresos</p>
            <p className="text-on-surface font-semibold">
              {totals.ingresos.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
              })}
            </p>
          </div>
          <div className="rounded-xl bg-surface-container-high p-sm">
            <p className="text-xs text-on-surface-variant">Egresos</p>
            <p className="text-on-surface font-semibold">
              {totals.egresos.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
              })}
            </p>
          </div>
          <div className="rounded-xl bg-surface-container-high p-sm">
            <p className="text-xs text-on-surface-variant">Balance</p>
            <p
              className={
                totals.balance >= 0
                  ? "font-semibold text-green-400"
                  : "font-semibold text-red-400"
              }
            >
              {totals.balance.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
              })}
            </p>
          </div>
        </div>

        <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
          Registros del emprendimiento
        </h3>

        {entries.length === 0 ? (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-lg text-center text-on-surface-variant">
            Todavía no hay movimientos cargados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-on-surface-variant border-b border-outline-variant/30">
                  <th className="py-2 pr-2">Fecha</th>
                  <th className="py-2 pr-2">Categoría</th>
                  <th className="py-2 pr-2">Movimiento</th>
                  <th className="py-2 pr-2">Total</th>
                  <th className="py-2 pr-2">Estado</th>
                  <th className="py-2"> </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className={
                      entry.id === editingId
                        ? "border-b border-outline-variant/10 bg-primary/10"
                        : "border-b border-outline-variant/10"
                    }
                  >
                    <td className="py-2 pr-2">{formatTableDate(entry.date)}</td>
                    <td className="py-2 pr-2">
                      {entry.category}
                      {entry.subcategory
                        ? ` / ${
                            materialSubcategoryLabels[
                              entry.subcategory as MaterialSubcategory
                            ] ?? entry.subcategory
                          }`
                        : ""}
                    </td>
                    <td className="py-2 pr-2 capitalize">{entry.movementType}</td>
                    <td className="py-2 pr-2">
                      {entry.totalAmount.toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      })}
                    </td>
                    <td className="py-2 pr-2">
                      <SettlementStatusIcon
                        movementType={entry.movementType}
                        totalAmount={entry.totalAmount}
                        paidAmount={entry.paidAmount}
                        isPaid={entry.isPaid}
                      />
                    </td>
                    <td className="py-2 w-10">
                      <button
                        type="button"
                        onClick={() => startEdit(entry)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-primary hover:bg-primary/10 transition-colors"
                        aria-label="Editar movimiento"
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
