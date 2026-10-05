"use client";

import type { ComponentProps, ReactNode } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";

const PAGE_SIZE = 10;

export function normalizeFinanceSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function matchesFinanceQuery(
  parts: Array<string | number | null | undefined>,
  query: string,
) {
  const term = normalizeFinanceSearch(query);
  if (!term) return true;
  const haystack = normalizeFinanceSearch(
    parts
      .filter((part) => part != null && String(part).trim() !== "")
      .join(" "),
  );
  return haystack.includes(term);
}

export function paginateFinanceEntries<T>(entries: T[], page: number) {
  const pageCount = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), pageCount);
  const start = (safePage - 1) * PAGE_SIZE;
  return {
    page: safePage,
    pageCount,
    items: entries.slice(start, start + PAGE_SIZE),
  };
}

export function FinanceSearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Buscar por descripción, categoría o fecha"
      aria-label="Buscar movimientos"
      className="mb-sm w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
    />
  );
}

export function FinanceDetail({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <p>
      <span>{label}: </span>
      <span className="text-on-surface">{children}</span>
    </p>
  );
}

export function FinanceMobileEntry({
  date,
  category,
  description,
  amount,
  expanded,
  onToggle,
  children,
}: {
  date: string;
  category: string;
  description: string;
  amount: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <li className="border-b border-outline-variant/10 py-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xs text-on-surface-variant">{date}</p>
            <p className="shrink-0 text-sm font-semibold text-on-surface">
              {amount}
            </p>
          </div>
          <p className="text-sm font-semibold text-on-surface">{category}</p>
          <p className="line-clamp-2 text-sm text-on-surface">{description}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={expanded ? "Ocultar detalle" : "Ver detalle"}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high"
        >
          <MaterialIcon name={expanded ? "expand_less" : "expand_more"} />
        </button>
      </div>
      {expanded ? (
        <div className="mt-2 flex flex-col gap-1 text-sm text-on-surface-variant">
          {children}
        </div>
      ) : null}
    </li>
  );
}

export function FinanceDeleteButton({
  action,
  id,
  pending,
  message,
  label,
}: {
  action: NonNullable<ComponentProps<"form">["action"]>;
  id: string;
  pending: boolean;
  message: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className={
          label
            ? "inline-flex items-center gap-1 text-sm text-error disabled:opacity-50"
            : "inline-flex h-8 w-8 items-center justify-center rounded-full text-error hover:bg-error/10 disabled:opacity-50"
        }
        aria-label="Eliminar movimiento"
        title="Eliminar"
      >
        <MaterialIcon name="delete" className="text-base" />
        {label}
      </button>
    </form>
  );
}

export function FinanceListPager({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  return (
    <div className="mt-sm flex items-center justify-between gap-sm">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border border-outline-variant/40 px-4 py-2 text-sm text-on-surface disabled:opacity-40"
      >
        Anterior
      </button>
      <p className="text-sm text-on-surface-variant">
        Página {page} de {pageCount}
      </p>
      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border border-outline-variant/40 px-4 py-2 text-sm text-on-surface disabled:opacity-40"
      >
        Siguiente
      </button>
    </div>
  );
}
