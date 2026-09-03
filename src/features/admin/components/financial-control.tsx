"use client";

import { useActionState, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { MoneyInput } from "@/components/ui/money-input";
import { saveFamilyEntryAction } from "@/features/finance/actions/create-family-entry";
import {
  familyCategories,
  getPaymentStatus,
  type FamilyFinanceEntry,
  type MovementType,
  type VentureFinanceEntry,
} from "@/features/finance/types";
import { VentureFinancePanel } from "./venture-finance-panel";

type Scope = "familiar" | "emprendimiento";

type FormState = {
  date: string;
  category: string;
  description: string;
  movementType: MovementType;
  totalAmount: string;
  paidAmount: string;
  isPaid: boolean;
};

function amountToRaw(value: number) {
  if (!value) return "";
  return String(value);
}

function entryToForm(entry: {
  date: string;
  category: string;
  description: string;
  movementType: MovementType;
  totalAmount: number;
  paidAmount: number;
  isPaid: boolean;
}): FormState {
  return {
    date: entry.date,
    category: entry.category,
    description: entry.description,
    movementType: entry.movementType,
    totalAmount: amountToRaw(entry.totalAmount),
    paidAmount: amountToRaw(entry.paidAmount),
    isPaid: entry.isPaid,
  };
}

function getTodayDate() {
  return new Date().toLocaleDateString("en-CA");
}

function emptyForm(): FormState {
  return {
    date: getTodayDate(),
    category: "",
    description: "",
    movementType: "egreso",
    totalAmount: "",
    paidAmount: "",
    isPaid: false,
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

export function FinancialControl({
  familyEntries: initialFamilyEntries,
  ventureEntries = [],
}: {
  familyEntries: FamilyFinanceEntry[];
  ventureEntries?: VentureFinanceEntry[];
}) {
  const [scope, setScope] = useState<Scope>("familiar");
  const [familyForm, setFamilyForm] = useState<FormState>(emptyForm);
  const [familyEntries, setFamilyEntries] = useState(initialFamilyEntries);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [familyState, familyAction, familyPending] = useActionState(
    saveFamilyEntryAction,
    null,
  );
  const [prevFamilyState, setPrevFamilyState] = useState(familyState);

  if (familyState !== prevFamilyState) {
    setPrevFamilyState(familyState);
    const savedEntry = familyState?.entry;
    if (savedEntry) {
      setFamilyEntries((prev) => {
        const exists = prev.some((entry) => entry.id === savedEntry.id);
        if (exists) {
          return prev.map((entry) =>
            entry.id === savedEntry.id ? savedEntry : entry,
          );
        }

        return [savedEntry, ...prev];
      });
      setFamilyForm(emptyForm());
      setEditingId(null);
    }
  }

  function setCurrentForm(updater: Partial<FormState>) {
    setFamilyForm((prev) => ({ ...prev, ...updater }));
  }

  function startEdit(entry: FamilyFinanceEntry) {
    setEditingId(entry.id);
    setFamilyForm(entryToForm(entry));
  }

  function cancelEdit() {
    setEditingId(null);
    setFamilyForm(emptyForm());
  }

  const totalIngresos = useMemo(
    () =>
      familyEntries
        .filter((entry) => entry.movementType === "ingreso")
        .reduce((acc, entry) => acc + entry.totalAmount, 0),
    [familyEntries],
  );

  const totalEgresos = useMemo(
    () =>
      familyEntries
        .filter((entry) => entry.movementType === "egreso")
        .reduce((acc, entry) => acc + entry.totalAmount, 0),
    [familyEntries],
  );

  const balance = totalIngresos - totalEgresos;

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex gap-sm">
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setScope("familiar");
          }}
          className={
            scope === "familiar"
              ? "px-4 py-2 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps"
              : "px-4 py-2 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps"
          }
        >
          Familiar
        </button>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setScope("emprendimiento");
          }}
          className={
            scope === "emprendimiento"
              ? "px-4 py-2 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps"
              : "px-4 py-2 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps"
          }
        >
          Emprendimiento
        </button>
      </div>

      {scope === "emprendimiento" ? (
        <VentureFinancePanel entries={ventureEntries} />
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-lg">
          <article className="rounded-2xl border border-outline-variant/20 bg-surface-container p-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">
              {editingId ? "Editar" : "Carga de"} control familiar
            </h2>

            <form action={familyAction} className="flex flex-col gap-sm">
              {familyState?.error ? (
                <div className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
                  {familyState.error}
                </div>
              ) : null}

              {editingId ? (
                <input type="hidden" name="id" value={editingId} />
              ) : null}

              <label className="flex flex-col gap-xs">
                <span className="text-sm text-on-surface-variant">Fecha</span>
                <input
                  name="date"
                  type="date"
                  value={familyForm.date}
                  onChange={(event) =>
                    setCurrentForm({ date: event.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-xs">
                <span className="text-sm text-on-surface-variant">Categoría</span>
                <select
                  name="category"
                  value={familyForm.category}
                  onChange={(event) =>
                    setCurrentForm({ category: event.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
                >
                  <option value="">Seleccioná una categoría</option>
                  {(familyCategories as readonly string[]).includes(
                    familyForm.category,
                  ) || !familyForm.category ? null : (
                    <option value={familyForm.category}>
                      {familyForm.category}
                    </option>
                  )}
                  {familyCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-xs">
                <span className="text-sm text-on-surface-variant">
                  Descripción
                </span>
                <textarea
                  name="description"
                  placeholder="Detalle del movimiento"
                  value={familyForm.description}
                  onChange={(event) =>
                    setCurrentForm({ description: event.target.value })
                  }
                  required
                  rows={3}
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
                />
              </label>

              <div className="flex gap-md">
                <label className="inline-flex items-center gap-xs">
                  <input
                    type="radio"
                    name="movementType"
                    value="ingreso"
                    checked={familyForm.movementType === "ingreso"}
                    onChange={() => setCurrentForm({ movementType: "ingreso" })}
                  />
                  <span className="text-on-surface">Ingreso</span>
                </label>
                <label className="inline-flex items-center gap-xs">
                  <input
                    type="radio"
                    name="movementType"
                    value="egreso"
                    checked={familyForm.movementType === "egreso"}
                    onChange={() => setCurrentForm({ movementType: "egreso" })}
                  />
                  <span className="text-on-surface">Egreso</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                <label className="flex flex-col gap-xs">
                  <span className="text-sm text-on-surface-variant">
                    Monto total
                  </span>
                  <MoneyInput
                    name="totalAmount"
                    value={familyForm.totalAmount}
                    onChange={(value) => setCurrentForm({ totalAmount: value })}
                    required
                    placeholder="$ 0"
                  />
                </label>
                <label className="flex flex-col gap-xs">
                  <span className="text-sm text-on-surface-variant">
                    {familyForm.movementType === "ingreso"
                      ? "Monto cobrado"
                      : "Monto pagado"}
                  </span>
                  <MoneyInput
                    name="paidAmount"
                    value={familyForm.paidAmount}
                    onChange={(value) => setCurrentForm({ paidAmount: value })}
                    placeholder="$ 0"
                  />
                </label>
              </div>

              <label className="inline-flex items-center gap-xs">
                <input
                  name="isPaid"
                  type="checkbox"
                  checked={familyForm.isPaid}
                  onChange={(event) =>
                    setCurrentForm({ isPaid: event.target.checked })
                  }
                />
                <span className="text-on-surface">
                  {familyForm.movementType === "ingreso"
                    ? "Ya está cobrado"
                    : "Ya está pagado"}
                </span>
              </label>

              <div className="flex gap-sm mt-sm">
                <button
                  type="submit"
                  disabled={familyPending}
                  className="flex-1 rounded-lg bg-primary-container px-6 py-3 text-white font-label-caps text-label-caps tracking-widest uppercase hover:bg-secondary-container transition-colors disabled:opacity-50"
                >
                  {familyPending
                    ? "Guardando..."
                    : editingId
                      ? "Guardar cambios"
                      : "Guardar movimiento"}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-lg border border-outline-variant/40 px-4 py-3 text-on-surface-variant font-label-caps text-label-caps tracking-widest uppercase hover:bg-surface-container-high transition-colors"
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
                  {totalIngresos.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </p>
              </div>
              <div className="rounded-xl bg-surface-container-high p-sm">
                <p className="text-xs text-on-surface-variant">Egresos</p>
                <p className="text-on-surface font-semibold">
                  {totalEgresos.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </p>
              </div>
              <div className="rounded-xl bg-surface-container-high p-sm">
                <p className="text-xs text-on-surface-variant">Balance</p>
                <p
                  className={
                    balance >= 0
                      ? "font-semibold text-green-400"
                      : "font-semibold text-red-400"
                  }
                >
                  {balance.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </p>
              </div>
            </div>

            <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
              Registros familiares
            </h3>

            {familyEntries.length === 0 ? (
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
                      <th className="py-2 pr-2">Cobrado / Pagado</th>
                      <th className="py-2">Estado</th>
                      <th className="py-2"> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {familyEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        className={
                          entry.id === editingId
                            ? "border-b border-outline-variant/10 bg-primary/10"
                            : "border-b border-outline-variant/10"
                        }
                      >
                        <td className="py-2 pr-2">{formatTableDate(entry.date)}</td>
                        <td className="py-2 pr-2">{entry.category}</td>
                        <td className="py-2 pr-2 capitalize">
                          {entry.movementType}
                        </td>
                        <td className="py-2 pr-2">
                          {entry.totalAmount.toLocaleString("es-AR", {
                            style: "currency",
                            currency: "ARS",
                          })}
                        </td>
                        <td className="py-2 pr-2">
                          {entry.paidAmount.toLocaleString("es-AR", {
                            style: "currency",
                            currency: "ARS",
                          })}
                        </td>
                        <td className="py-2">
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
      )}
    </div>
  );
}
