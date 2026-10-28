"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Botón con ícono y texto: en mobile ocupa todo el ancho del menú. */
export const rowActionClass =
  "inline-flex h-10 w-full items-center gap-sm rounded-lg px-3 text-left text-primary hover:bg-primary/10 disabled:opacity-50 sm:h-8 sm:w-auto sm:gap-1 sm:rounded-full sm:px-2";

/** Botón que en escritorio es solo un ícono; en mobile muestra además el texto. */
export const rowIconActionClass =
  "inline-flex h-10 w-full items-center gap-sm rounded-lg px-3 text-left text-primary hover:bg-primary/10 disabled:opacity-50 sm:h-8 sm:w-8 sm:justify-center sm:rounded-full sm:px-0";

export const rowDangerActionClass = rowIconActionClass
  .replace("text-primary", "text-error")
  .replace("hover:bg-primary/10", "hover:bg-error/10");

/** Texto de una acción de ícono: solo se ve dentro del menú desplegable de mobile. */
export function RowActionLabel({ children }: { children: ReactNode }) {
  return <span className="text-sm sm:hidden">{children}</span>;
}

type RowActionsMenuProps = {
  children: ReactNode;
  /** Nombre accesible del botón (ej: "Acciones de Tateti"). */
  label: string;
  /** Posicionamiento del contenedor (tiene que dejarlo `relative` o `absolute`), ej: "absolute right-2 top-2 sm:static". Por defecto `relative`. */
  className?: string;
};

/**
 * En mobile las acciones quedan detrás de un ícono de tres puntos que despliega
 * un menú; desde `sm` se muestran en línea, como siempre. Los hijos se renderizan
 * una sola vez (los formularios siguen en el DOM aunque el menú esté cerrado).
 */
export function RowActionsMenu({ children, label, className }: RowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={className ?? "relative"}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-primary/10 sm:hidden"
      >
        {/* SVG propio: no depende de la fuente de íconos. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
        >
          {open ? (
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          ) : (
            <path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          )}
        </svg>
      </button>

      <div
        role="group"
        aria-label={label}
        // Cualquier acción cierra el menú; el formulario ya se envió al llegar el click acá.
        onClick={() => setOpen(false)}
        className={`${open ? "flex" : "hidden"} absolute right-0 top-full z-20 mt-1 min-w-52 flex-col gap-xs rounded-xl border border-outline-variant/30 bg-surface-container-high p-xs shadow-lg sm:static sm:mt-0 sm:flex sm:min-w-0 sm:flex-row sm:flex-wrap sm:items-center sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`}
      >
        {children}
      </div>
    </div>
  );
}
