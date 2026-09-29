"use client";

import { useEffect, useId, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MaterialIcon } from "@/components/ui/material-icon";

export function FinanceModal({
  open,
  title,
  onClose,
  children,
  maxWidth = "40rem",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}) {
  const titleId = useId();
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (document.querySelector("[data-price-calculator]")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onClose();
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  if (!open || !isClient) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100dvh",
        zIndex: 2147483646,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "24px 16px",
        overflowY: "auto",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="rounded-2xl border border-outline-variant/30 bg-surface-container"
        style={{
          width: "100%",
          maxWidth,
          marginTop: "auto",
          marginBottom: "auto",
          boxSizing: "border-box",
          padding: 24,
        }}
      >
        <div className="mb-md flex items-start justify-between gap-sm">
          <h2
            id={titleId}
            className="font-headline-md text-headline-md text-on-surface"
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="touch-target inline-flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
            style={{ minHeight: 44, minWidth: 44, flexShrink: 0 }}
          >
            <MaterialIcon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
