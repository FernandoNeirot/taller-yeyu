"use client";

import {
  useActionState,
  useEffect,
  useId,
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
import { QuoteItemsEditor } from "@/features/materials/components/quote-items-editor";
import { formatEditedAt, formatMoney } from "@/features/materials/lib/format";
import {
  emptyQuoteRow,
  itemsToRows,
  rowsToPayload,
  type QuoteItemRow,
} from "@/features/materials/lib/quote-rows";
import type { Material } from "@/types/material";
import { deleteQuoteAction } from "../actions/delete-quote";
import { saveQuoteAction } from "../actions/save-quote";
import type { Quote } from "../types";

function getTodayDate() {
  return new Date().toLocaleDateString("en-CA");
}

function formatTableDate(date: string) {
  const [, month, day] = date.split("-");
  if (!day || !month) return date;
  return `${day}-${month}`;
}

function quoteToRows(quote: Quote): QuoteItemRow[] {
  return quote.items.length === 0 ? [emptyQuoteRow()] : itemsToRows(quote.items);
}

export function QuoteBuilder({
  materials,
  quotes: initialQuotes,
}: {
  materials: Material[];
  quotes: Quote[];
}) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(getTodayDate);
  const [rows, setRows] = useState<QuoteItemRow[]>(() => [emptyQuoteRow()]);
  const [units, setUnits] = useState("1");
  const [quotes, setQuotes] = useState(initialQuotes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [state, action, pending] = useActionState(saveQuoteAction, null);
  // El error del servidor es de un envío puntual: al reabrir el formulario no debe reaparecer.
  const [dismissedState, setDismissedState] = useState(state);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteQuoteAction,
    null,
  );
  const titleId = useId();
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Líneas de cotizaciones viejas cuyo material ya no está en el catálogo.
  const orphanRows = rows.filter(
    (row) => row.materialId && !materials.some((item) => item.id === row.materialId),
  ).length;

  function resetForm() {
    setName("");
    setDate(getTodayDate());
    setRows([emptyQuoteRow()]);
    setUnits("1");
    setEditingId(null);
  }

  function closeModal() {
    setIsOpen(false);
    resetForm();
  }

  function startCreate() {
    resetForm();
    setDismissedState(state);
    setIsOpen(true);
  }

  function startEdit(quote: Quote) {
    setEditingId(quote.id);
    setName(quote.name);
    setDate(quote.date || getTodayDate());
    setRows(quoteToRows(quote));
    setUnits(String(quote.units));
    setDismissedState(state);
    setIsOpen(true);
  }

  // Cuando el servidor devuelve la cotización guardada se actualiza la lista y se cierra el modal.
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    const saved = state?.quote;
    if (saved) {
      setQuotes((prev) => {
        const exists = prev.some((quote) => quote.id === saved.id);
        if (exists) {
          return prev.map((quote) => (quote.id === saved.id ? saved : quote));
        }
        return [saved, ...prev];
      });
      setNotice(`Guardado: ${saved.name}`);
      closeModal();
    }
  }

  const [prevDeleteState, setPrevDeleteState] = useState(deleteState);
  if (deleteState !== prevDeleteState) {
    setPrevDeleteState(deleteState);
    const deletedId = deleteState?.deletedId;
    if (deletedId) {
      setQuotes((prev) => prev.filter((quote) => quote.id !== deletedId));
      if (editingId === deletedId) closeModal();
    }
  }

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (document.querySelector("[data-price-calculator]")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setIsOpen(false);
      setName("");
      setDate(getTodayDate());
      setRows([emptyQuoteRow()]);
      setUnits("1");
      setEditingId(null);
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [isOpen]);

  const serverError = state === dismissedState ? undefined : state?.error;

  function renderActions(quote: Quote, className: string) {
    return (
      <RowActionsMenu label={`Acciones de ${quote.name}`} className={className}>
        <button
          type="button"
          onClick={() => startEdit(quote)}
          className={rowIconActionClass}
          aria-label={`Editar ${quote.name}`}
          title="Editar"
        >
          <MaterialIcon name="edit" className="text-base" />
          <RowActionLabel>Editar</RowActionLabel>
        </button>
        <form
          action={deleteAction}
          className="w-full sm:w-auto"
          onSubmit={(event) => {
            if (
              !window.confirm(
                `¿Eliminar "${quote.name}"? Esta acción no se puede deshacer.`,
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={quote.id} />
          <button
            type="submit"
            disabled={deletePending}
            className={rowDangerActionClass}
            aria-label={`Eliminar ${quote.name}`}
            title="Eliminar"
          >
            <MaterialIcon name="delete" className="text-base" />
            <RowActionLabel>Eliminar</RowActionLabel>
          </button>
        </form>
      </RowActionsMenu>
    );
  }

  return (
    <section>
      <article className="rounded-2xl border border-outline-variant/20 bg-surface-container p-lg">
        <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Cotizaciones ({quotes.length})
          </h3>
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary-container px-4 py-3 text-white font-label-caps text-label-caps tracking-widest uppercase hover:bg-secondary-container transition-colors"
          >
            <MaterialIcon
              name="add"
              className="text-base leading-none normal-case tracking-normal"
            />
            Nueva cotización
          </button>
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
          <div className="mb-sm rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
            {deleteState.error}
          </div>
        ) : null}

        {quotes.length === 0 ? (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-lg text-center text-on-surface-variant">
            Todavía no hay cotizaciones guardadas.
          </div>
        ) : (
          <>
          {/* Mobile: una tarjeta por cotización, sin scroll horizontal. */}
          <ul className="flex flex-col gap-sm sm:hidden">
            {quotes.map((quote) => (
              <li
                key={quote.id}
                className="relative rounded-xl border border-outline-variant/20 bg-surface-container-low p-sm"
              >
                <div className="pr-10">
                  <p className="font-headline-md text-on-surface wrap-break-word">
                    {quote.name}
                  </p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Por unidad:{" "}
                    <span className="font-semibold text-on-surface">
                      {formatMoney(quote.totalAmount)}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Última edición: {formatEditedAt(quote.updatedAt)}
                  </p>
                </div>
                {renderActions(quote, "absolute right-2 top-2")}
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-on-surface-variant border-b border-outline-variant/30">
                  <th className="py-2 pr-2">Fecha</th>
                  <th className="py-2 pr-2">Nombre</th>
                  <th className="py-2 pr-2">Por unidad</th>
                  <th className="py-2 pr-2">Unidades</th>
                  <th className="py-2 pr-2">Tanda</th>
                  <th className="py-2 pr-2">Última edición</th>
                  <th className="py-2"> </th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr
                    key={quote.id}
                    className="border-b border-outline-variant/10"
                  >
                    <td className="py-2 pr-2">{formatTableDate(quote.date)}</td>
                    <td className="py-2 pr-2">{quote.name}</td>
                    <td className="py-2 pr-2 whitespace-nowrap">
                      {formatMoney(quote.totalAmount)}
                    </td>
                    <td className="py-2 pr-2 whitespace-nowrap">{quote.units}</td>
                    <td className="py-2 pr-2 whitespace-nowrap font-semibold">
                      {formatMoney(quote.batchCost)}
                    </td>
                    <td className="py-2 pr-2 whitespace-nowrap text-on-surface-variant">
                      {formatEditedAt(quote.updatedAt)}
                    </td>
                    <td className="py-2">
                      {renderActions(quote, "relative flex justify-end")}
                    </td>
                  </tr>
                ))}
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
                className="my-auto box-border w-full max-w-3xl rounded-2xl border border-outline-variant/30 bg-surface-container p-6"
              >
                <div className="mb-sm flex items-start justify-between gap-sm">
                  <h2
                    id={titleId}
                    className="font-headline-md text-headline-md text-on-surface"
                  >
                    {editingId ? "Editar cotización" : "Nueva cotización"}
                  </h2>
                  <button
                    type="button"
                    aria-label="Cerrar"
                    onClick={closeModal}
                    className="touch-target inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                  >
                    <MaterialIcon name="close" />
                  </button>
                </div>
                <p className="text-sm text-on-surface-variant mb-md">
                  Sumá los materiales del catálogo con sus medidas y cuántas
                  unidades entran: se calcula el costo por unidad. Abajo indicás
                  cuántas unidades vas a producir y ves cuánto cuesta la tanda.
                </p>

                <form action={action} className="flex flex-col gap-sm">
                  {serverError ? (
                    <div className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
                      {serverError}
                    </div>
                  ) : null}

                  {editingId ? (
                    <input type="hidden" name="id" value={editingId} />
                  ) : null}
                  <input type="hidden" name="date" value={date} />
                  <input
                    type="hidden"
                    name="items"
                    value={JSON.stringify(rowsToPayload(rows))}
                  />

                  <label className="flex flex-col gap-xs">
                    <span className="text-sm text-on-surface-variant">Nombre</span>
                    <input
                      name="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Ej: Llaveros"
                      required
                      autoFocus={!editingId}
                      className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
                    />
                  </label>

                  {orphanRows > 0 ? (
                    <div className="rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
                      {orphanRows === 1
                        ? "Un material de esta cotización ya no está en el catálogo."
                        : `${orphanRows} materiales de esta cotización ya no están en el catálogo.`}{" "}
                      Elegí el material de nuevo para recalcular.
                    </div>
                  ) : null}

                  <QuoteItemsEditor
                    rows={rows}
                    materials={materials}
                    onChange={setRows}
                    units={units}
                    onUnitsChange={setUnits}
                  />

                  <div className="flex gap-sm mt-sm">
                    <button
                      type="submit"
                      disabled={pending || materials.length === 0}
                      className="flex-1 rounded-lg bg-primary-container px-6 py-3 text-white font-label-caps text-label-caps tracking-widest uppercase hover:bg-secondary-container transition-colors disabled:opacity-50"
                    >
                      {pending
                        ? "Guardando..."
                        : editingId
                          ? "Guardar cambios"
                          : "Guardar cotización"}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-lg border border-outline-variant/40 px-4 py-3 text-on-surface-variant font-label-caps text-label-caps tracking-widest uppercase hover:bg-surface-container-high transition-colors"
                    >
                      Cancelar
                    </button>
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
