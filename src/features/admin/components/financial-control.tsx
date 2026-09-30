"use client";

import { useActionState, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { integerMoney, MoneyInput } from "@/components/ui/money-input";
import { CalculatorButton } from "@/components/ui/price-calculator";
import { formatFinanceAmount } from "@/features/finance/format-amount";
import { saveFamilyEntryAction } from "@/features/finance/actions/create-family-entry";
import { deleteFamilyEntryAction } from "@/features/finance/actions/delete-finance-entry";
import {
  familyCategories,
  getPaymentStatus,
  type FamilyFinanceEntry,
  type MovementType,
  type VentureFinanceEntry,
} from "@/features/finance/types";
import { FinanceModal } from "./finance-modal";
import { FinanceReports } from "./finance-reports";
import {
  FinanceDeleteButton,
  FinanceDetail,
  FinanceListPager,
  FinanceMobileEntry,
  FinanceSearchField,
  matchesFinanceQuery,
  paginateFinanceEntries,
} from "./finance-list-controls";
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
  return String(Math.round(value));
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
    isPaid: true,
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
      role="img"
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
  const [formOpen, setFormOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [familyState, familyAction, familyPending] = useActionState(
    saveFamilyEntryAction,
    null,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteFamilyEntryAction,
    null,
  );
  const [prevFamilyState, setPrevFamilyState] = useState(familyState);
  const [prevDeleteState, setPrevDeleteState] = useState(deleteState);

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
      setFormOpen(false);
      setPage(1);
    }
  }

  if (deleteState !== prevDeleteState) {
    setPrevDeleteState(deleteState);
    const deletedId = deleteState?.deletedId;
    if (deletedId) {
      setFamilyEntries((prev) => prev.filter((entry) => entry.id !== deletedId));
      setExpandedIds((current) => current.filter((id) => id !== deletedId));
      if (editingId === deletedId) {
        setFormOpen(false);
        setEditingId(null);
        setFamilyForm(emptyForm());
      }
    }
  }

  function setCurrentForm(updater: Partial<FormState>) {
    setFamilyForm((prev) => ({ ...prev, ...updater }));
  }

  function startCreate() {
    setEditingId(null);
    setFamilyForm(emptyForm());
    setFormOpen(true);
  }

  function startEdit(entry: FamilyFinanceEntry) {
    setEditingId(entry.id);
    setFamilyForm(entryToForm(entry));
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setFamilyForm(emptyForm());
  }

  function showPage(next: number) {
    setPage(next);
    setExpandedIds([]);
  }

  function toggleExpanded(id: string) {
    setExpandedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
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
  const reportLines = useMemo(
    () =>
      familyEntries.map((entry) => ({
        id: entry.id,
        date: entry.date,
        category: entry.category,
        description: entry.description,
        movementType: entry.movementType,
        totalAmount: entry.totalAmount,
      })),
    [familyEntries],
  );
  const filteredEntries = useMemo(
    () =>
      familyEntries.filter((entry) =>
        matchesFinanceQuery(
          [
            entry.date,
            formatTableDate(entry.date),
            entry.category,
            entry.description,
            entry.movementType,
            entry.totalAmount,
          ],
          query,
        ),
      ),
    [familyEntries, query],
  );
  const entryPage = paginateFinanceEntries(filteredEntries, page);

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex gap-sm">
        <button
          type="button"
          onClick={() => {
            closeForm();
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
            closeForm();
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
        <>
          <FinanceModal
            open={formOpen}
            title={editingId ? "Editar movimiento" : "Nuevo movimiento"}
            onClose={closeForm}
          >
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

              <div className="flex flex-col gap-xs">
                <span className="text-sm text-on-surface-variant">Categoría</span>
                <SearchableSelect
                  name="category"
                  required
                  value={familyForm.category}
                  onChange={(category) => setCurrentForm({ category })}
                  placeholder="Seleccioná una categoría"
                  searchPlaceholder="Buscar categoría..."
                  options={[
                    ...((familyCategories as readonly string[]).includes(
                      familyForm.category,
                    ) || !familyForm.category
                      ? []
                      : [
                          {
                            value: familyForm.category,
                            label: familyForm.category,
                          },
                        ]),
                    ...familyCategories.map((category) => ({
                      value: category,
                      label: category,
                    })),
                  ]}
                />
              </div>

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
                  <div className="flex gap-sm">
                    <div className="flex-1">
                      <MoneyInput integer
                        name="totalAmount"
                        value={familyForm.totalAmount}
                        onChange={(value) =>
                          setCurrentForm({ totalAmount: value })
                        }
                        required
                        placeholder="$ 0"
                      />
                    </div>
                    <CalculatorButton
                      value={familyForm.totalAmount}
                      onApply={(value) =>
                        setCurrentForm({ totalAmount: integerMoney(value) })
                      }
                    />
                  </div>
                </label>
                <label className="flex flex-col gap-xs">
                  <span className="text-sm text-on-surface-variant">
                    {familyForm.movementType === "ingreso"
                      ? "Monto cobrado"
                      : "Monto pagado"}
                  </span>
                  <MoneyInput integer
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
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-outline-variant/40 px-4 py-3 text-on-surface-variant font-label-caps text-label-caps tracking-widest uppercase hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </FinanceModal>

          <article className="rounded-2xl border border-outline-variant/20 bg-surface-container p-lg">
            <div className="grid grid-cols-3 gap-sm mb-md">
              <div className="rounded-xl bg-surface-container-high p-sm">
                <p className="text-xs text-on-surface-variant">Ingresos</p>
                <p className="text-on-surface font-semibold">
                  {formatFinanceAmount(totalIngresos)}
                </p>
              </div>
              <div className="rounded-xl bg-surface-container-high p-sm">
                <p className="text-xs text-on-surface-variant">Egresos</p>
                <p className="text-on-surface font-semibold">
                  {formatFinanceAmount(totalEgresos)}
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
                  {formatFinanceAmount(balance)}
                </p>
              </div>
            </div>

            <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Registros familiares
              </h2>
              <button
                type="button"
                onClick={startCreate}
                className="rounded-lg bg-primary-container px-4 py-2 text-white font-label-caps text-label-caps tracking-widest uppercase hover:bg-secondary-container transition-colors"
              >
                Nuevo movimiento
              </button>
            </div>
            <FinanceReports scope="Familiar" lines={reportLines} />
            {deleteState?.error ? (
              <div className="mb-sm rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
                {deleteState.error}
              </div>
            ) : null}

            {familyEntries.length === 0 ? (
              <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-lg text-center text-on-surface-variant">
                Todavía no hay movimientos cargados.
              </div>
            ) : (
              <>
                <FinanceSearchField
                  value={query}
                  onChange={(value) => {
                    setQuery(value);
                    setPage(1);
                    setExpandedIds([]);
                  }}
                />
                {filteredEntries.length === 0 ? (
                  <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-lg text-center text-on-surface-variant">
                    No hay movimientos que coincidan con la búsqueda.
                  </div>
                ) : (
                  <>
                    <ul className="min-[450px]:hidden">
                      {entryPage.items.map((entry) => (
                        <FinanceMobileEntry
                          key={entry.id}
                          date={formatTableDate(entry.date)}
                          category={entry.category}
                          description={entry.description}
                          expanded={expandedIds.includes(entry.id)}
                          onToggle={() => toggleExpanded(entry.id)}
                        >
                          <FinanceDetail label="Movimiento">
                            <span className="capitalize">{entry.movementType}</span>
                          </FinanceDetail>
                          <FinanceDetail label="Total">
                            {formatFinanceAmount(entry.totalAmount)}
                          </FinanceDetail>
                          <FinanceDetail label="Cobrado / Pagado">
                            {formatFinanceAmount(entry.paidAmount)}
                          </FinanceDetail>
                          <FinanceDetail label="Estado">
                            <SettlementStatusIcon
                              movementType={entry.movementType}
                              totalAmount={entry.totalAmount}
                              paidAmount={entry.paidAmount}
                              isPaid={entry.isPaid}
                            />
                          </FinanceDetail>
                          <div className="mt-1 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => startEdit(entry)}
                              className="inline-flex items-center gap-1 text-sm text-primary"
                            >
                              <MaterialIcon name="edit" className="text-base" />
                              Editar
                            </button>
                            <FinanceDeleteButton
                              action={deleteAction}
                              id={entry.id}
                              pending={deletePending}
                              message="¿Eliminar este movimiento? Esta acción no se puede deshacer."
                              label="Eliminar"
                            />
                          </div>
                        </FinanceMobileEntry>
                      ))}
                    </ul>
                    <div className="hidden overflow-x-auto min-[450px]:block">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-on-surface-variant border-b border-outline-variant/30">
                            <th className="py-2 pr-2">Fecha</th>
                            <th className="py-2 pr-2">Categoría</th>
                            <th className="py-2 pr-2">Descripción</th>
                            <th className="py-2 pr-2">Movimiento</th>
                            <th className="py-2 pr-2">Total</th>
                            <th className="py-2 pr-2">Cobrado / Pagado</th>
                            <th className="py-2">Estado</th>
                            <th className="py-2"> </th>
                          </tr>
                        </thead>
                        <tbody>
                          {entryPage.items.map((entry) => (
                            <tr
                              key={entry.id}
                              className="border-b border-outline-variant/10"
                            >
                              <td className="py-2 pr-2">{formatTableDate(entry.date)}</td>
                              <td className="py-2 pr-2">{entry.category}</td>
                              <td className="max-w-xs py-2 pr-2">
                                <span className="line-clamp-2">{entry.description}</span>
                              </td>
                              <td className="py-2 pr-2 capitalize">
                                {entry.movementType}
                              </td>
                              <td className="py-2 pr-2">
                                {formatFinanceAmount(entry.totalAmount)}
                              </td>
                              <td className="py-2 pr-2">
                                {formatFinanceAmount(entry.paidAmount)}
                              </td>
                              <td className="py-2">
                                <SettlementStatusIcon
                                  movementType={entry.movementType}
                                  totalAmount={entry.totalAmount}
                                  paidAmount={entry.paidAmount}
                                  isPaid={entry.isPaid}
                                />
                              </td>
                              <td className="py-2">
                                <div className="flex items-center">
                                  <button
                                    type="button"
                                    onClick={() => startEdit(entry)}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-primary hover:bg-primary/10 transition-colors"
                                    aria-label="Editar movimiento"
                                    title="Editar"
                                  >
                                    <MaterialIcon name="edit" className="text-base" />
                                  </button>
                                  <FinanceDeleteButton
                                    action={deleteAction}
                                    id={entry.id}
                                    pending={deletePending}
                                    message="¿Eliminar este movimiento? Esta acción no se puede deshacer."
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <FinanceListPager
                      page={entryPage.page}
                      pageCount={entryPage.pageCount}
                      onPageChange={showPage}
                    />
                  </>
                )}
              </>
            )}
          </article>
        </>
      )}
    </div>
  );
}
