"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { MoneyInput, moneyToNumber } from "@/components/ui/money-input";
import { saveFamilyEntryAction } from "@/features/finance/actions/create-family-entry";
import type { FamilyFinanceEntry } from "@/features/finance/types";
import { getPaymentStatus, type MovementType } from "@/features/finance/types";

type Scope = "familiar" | "emprendimiento";

type VentureEntry = {
  id: string;
  date: string;
  category: string;
  description: string;
  movementType: MovementType;
  totalAmount: number;
  paidAmount: number;
  isPaid: boolean;
};

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
const initialForm: FormState = {
  date: "",
  category: "",
  description: "",
  movementType: "egreso",
  totalAmount: "",
  paidAmount: "",
  isPaid: false,
};

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

export function FinancialControl({
  familyEntries: initialFamilyEntries,
}: {
  familyEntries: FamilyFinanceEntry[];
}) {
  const [scope, setScope] = useState<Scope>("familiar");
  const [familyForm, setFamilyForm] = useState<FormState>(initialForm);
  const [ventureForm, setVentureForm] = useState<FormState>(initialForm);
  const [familyEntries, setFamilyEntries] = useState(initialFamilyEntries);
  const [ventureEntries, setVentureEntries] = useState<VentureEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [familyState, familyAction, familyPending] = useActionState(
    saveFamilyEntryAction,
    null,
  );

  const currentForm = scope === "familiar" ? familyForm : ventureForm;

  function setCurrentForm(updater: Partial<FormState>) {
    if (scope === "familiar") {
      setFamilyForm((prev) => ({ ...prev, ...updater }));
      return;
    }

    setVentureForm((prev) => ({ ...prev, ...updater }));
  }

  function startEdit(entry: {
    id: string;
    date: string;
    category: string;
    description: string;
    movementType: MovementType;
    totalAmount: number;
    paidAmount: number;
    isPaid: boolean;
  }) {
    setEditingId(entry.id);
    if (scope === "familiar") {
      setFamilyForm(entryToForm(entry));
      return;
    }
    setVentureForm(entryToForm(entry));
  }

  function cancelEdit() {
    setEditingId(null);
    if (scope === "familiar") {
      setFamilyForm(initialForm);
      return;
    }
    setVentureForm(initialForm);
  }

  useEffect(() => {
    const savedEntry = familyState?.entry;
    if (!savedEntry) return;

    setFamilyEntries((prev) => {
      const exists = prev.some((entry) => entry.id === savedEntry.id);
      if (exists) {
        return prev.map((entry) =>
          entry.id === savedEntry.id ? savedEntry : entry,
        );
      }

      return [savedEntry, ...prev];
    });
    setFamilyForm(initialForm);
    setEditingId(null);
  }, [familyState]);

  const visibleEntries =
    scope === "familiar"
      ? familyEntries.map((entry) => ({
          ...entry,
          scope: "familiar" as const,
        }))
      : ventureEntries.map((entry) => ({
          ...entry,
          remainingAmount: Math.max(entry.totalAmount - entry.paidAmount, 0),
          paymentStatus: getPaymentStatus(
            entry.totalAmount,
            entry.paidAmount,
            entry.isPaid,
          ),
          createdBy: "",
          scope: "emprendimiento" as const,
        }));

  const totalIngresos = useMemo(
    () =>
      visibleEntries
        .filter((entry) => entry.movementType === "ingreso")
        .reduce((acc, entry) => acc + entry.totalAmount, 0),
    [visibleEntries],
  );

  const totalEgresos = useMemo(
    () =>
      visibleEntries
        .filter((entry) => entry.movementType === "egreso")
        .reduce((acc, entry) => acc + entry.totalAmount, 0),
    [visibleEntries],
  );

  const balance = totalIngresos - totalEgresos;

  function submitVenture(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const totalAmount = moneyToNumber(ventureForm.totalAmount);
    const paidAmount = moneyToNumber(ventureForm.paidAmount || "0");

    if (!ventureForm.date || !ventureForm.category || !ventureForm.description) {
      return;
    }
    if (Number.isNaN(totalAmount) || totalAmount <= 0) return;
    if (Number.isNaN(paidAmount) || paidAmount < 0) return;

    const normalizedPaidAmount = ventureForm.isPaid
      ? totalAmount
      : Math.min(paidAmount, totalAmount);

    const nextEntry: VentureEntry = {
      id: editingId ?? crypto.randomUUID(),
      date: ventureForm.date,
      category: ventureForm.category,
      description: ventureForm.description,
      movementType: ventureForm.movementType,
      totalAmount,
      paidAmount: normalizedPaidAmount,
      isPaid: ventureForm.isPaid || normalizedPaidAmount >= totalAmount,
    };

    setVentureEntries((prev) => {
      if (editingId) {
        return prev.map((entry) =>
          entry.id === editingId ? nextEntry : entry,
        );
      }

      return [nextEntry, ...prev];
    });
    setVentureForm(initialForm);
    setEditingId(null);
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-lg">
      <article className="rounded-2xl border border-outline-variant/20 bg-surface-container p-lg">
        <div className="flex gap-sm mb-md">
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

        <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">
          {editingId ? "Editar" : "Carga de"}{" "}
          {scope === "familiar"
            ? "control familiar"
            : "control del emprendimiento"}
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-md">
          {scope === "familiar"
            ? "Los movimientos familiares se guardan en Firebase."
            : "Registrá ingresos y egresos del negocio para medir rentabilidad."}
        </p>

        <form
          action={scope === "familiar" ? familyAction : undefined}
          onSubmit={scope === "emprendimiento" ? submitVenture : undefined}
          className="flex flex-col gap-sm"
        >
          {scope === "familiar" && familyState?.error ? (
            <div className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
              {familyState.error}
            </div>
          ) : null}

          {editingId ? <input type="hidden" name="id" value={editingId} /> : null}

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">Fecha</span>
            <input
              name="date"
              type="date"
              value={currentForm.date}
              onChange={(event) => setCurrentForm({ date: event.target.value })}
              required
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
            />
          </label>

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">Categoría</span>
            <input
              name="category"
              type="text"
              placeholder={
                scope === "familiar"
                  ? "Hogar, Servicios, Comida..."
                  : "Ventas, Insumos, Envíos..."
              }
              value={currentForm.category}
              onChange={(event) =>
                setCurrentForm({ category: event.target.value })
              }
              required
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
            />
          </label>

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">Descripción</span>
            <textarea
              name="description"
              placeholder="Detalle del movimiento"
              value={currentForm.description}
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
                checked={currentForm.movementType === "ingreso"}
                onChange={() => setCurrentForm({ movementType: "ingreso" })}
              />
              <span className="text-on-surface">Ingreso</span>
            </label>
            <label className="inline-flex items-center gap-xs">
              <input
                type="radio"
                name="movementType"
                value="egreso"
                checked={currentForm.movementType === "egreso"}
                onChange={() => setCurrentForm({ movementType: "egreso" })}
              />
              <span className="text-on-surface">Egreso</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">Monto total</span>
              <MoneyInput
                name="totalAmount"
                value={currentForm.totalAmount}
                onChange={(value) => setCurrentForm({ totalAmount: value })}
                required
                placeholder="$ 0"
              />
            </label>
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">
                {currentForm.movementType === "ingreso"
                  ? "Monto cobrado"
                  : "Monto pagado"}
              </span>
              <MoneyInput
                name="paidAmount"
                value={currentForm.paidAmount}
                onChange={(value) => setCurrentForm({ paidAmount: value })}
                placeholder="$ 0"
              />
            </label>
          </div>

          <label className="inline-flex items-center gap-xs">
            <input
              name="isPaid"
              type="checkbox"
              checked={currentForm.isPaid}
              onChange={(event) =>
                setCurrentForm({ isPaid: event.target.checked })
              }
            />
            <span className="text-on-surface">
              {currentForm.movementType === "ingreso"
                ? "Ya está cobrado"
                : "Ya está pagado"}
            </span>
          </label>

          <div className="flex gap-sm mt-sm">
            <button
              type="submit"
              disabled={scope === "familiar" && familyPending}
              className="flex-1 rounded-lg bg-primary-container px-6 py-3 text-white font-label-caps text-label-caps tracking-widest uppercase hover:bg-secondary-container transition-colors disabled:opacity-50"
            >
              {scope === "familiar" && familyPending
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
          {scope === "familiar"
            ? "Registros familiares"
            : "Registros del emprendimiento"}
        </h3>

        {visibleEntries.length === 0 ? (
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
                {visibleEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className={
                      entry.id === editingId
                        ? "border-b border-outline-variant/10 bg-primary/10"
                        : "border-b border-outline-variant/10"
                    }
                  >
                    <td className="py-2 pr-2">{entry.date}</td>
                    <td className="py-2 pr-2">{entry.category}</td>
                    <td className="py-2 pr-2 capitalize">{entry.movementType}</td>
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
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2 py-1">
                        <MaterialIcon name="payments" className="text-sm" />
                        {settlementLabel(
                          entry.movementType,
                          entry.totalAmount,
                          entry.paidAmount,
                          entry.isPaid,
                        )}
                      </span>
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
