import type { ReactNode } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";

export const fieldClassName =
  "w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary";

export const invalidFieldClassName =
  "w-full rounded-lg border border-error bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-error";

export function fieldClass(error?: string) {
  return error ? invalidFieldClassName : fieldClassName;
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-error">
      {message}
    </p>
  );
}

export function FormBanner({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error"
    >
      {children}
    </div>
  );
}

export function FormSection({
  id,
  title,
  summary,
  open,
  hasError = false,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  summary?: string;
  open: boolean;
  hasError?: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section
      className={
        hasError
          ? "rounded-xl border border-error/60 bg-surface-container-low/40"
          : "rounded-xl border border-outline-variant/30 bg-surface-container-low/40"
      }
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-sm px-4 py-3 text-left"
      >
        <span className="min-w-0">
          <span className="block font-semibold text-on-surface">{title}</span>
          {!open && summary ? (
            <span className="mt-0.5 block text-xs text-on-surface-variant">
              {summary}
            </span>
          ) : null}
        </span>
        <MaterialIcon name={open ? "expand_less" : "expand_more"} />
      </button>
      <div
        id={id}
        hidden={!open}
        className={open ? "flex flex-col gap-sm px-4 pb-4" : undefined}
      >
        {children}
      </div>
    </section>
  );
}
