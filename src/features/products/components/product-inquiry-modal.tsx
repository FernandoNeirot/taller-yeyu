"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { MaterialIcon } from "@/components/ui/material-icon";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import {
  DEFAULT_WHATSAPP_PHONE,
  buildWhatsAppLink,
  productWhatsAppMessage,
} from "@/lib/whatsapp";
import type { Product } from "@/types/product";

type ProductInquiryModalProps = {
  product: Product;
  onClose: () => void;
};

function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const fieldClassName =
  "rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 font-body-md text-body-md text-on-surface outline-none focus:border-primary";

export function ProductInquiryModal({
  product,
  onClose,
}: ProductInquiryModalProps) {
  const titleId = useId();
  const [neededBy, setNeededBy] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [topic, setTopic] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onClose();
    }

    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const url = buildWhatsAppLink({
      phoneNumber: DEFAULT_WHATSAPP_PHONE,
      message: productWhatsAppMessage(product, {
        neededBy,
        quantity,
        topic: topic.trim(),
        address: address.trim(),
        description: description.trim(),
      }),
    });

    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  }

  return createPortal(
    <div
      onClick={onClose}
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
        onClick={(event) => event.stopPropagation()}
        className="rounded-2xl border border-outline-variant/30 bg-surface-container"
        style={{
          width: "100%",
          maxWidth: "28rem",
          marginTop: "auto",
          marginBottom: "auto",
          boxSizing: "border-box",
          padding: 24,
        }}
      >
        <div className="mb-md flex items-start justify-between gap-sm">
          <div>
            <p className="font-label-caps text-label-caps tracking-widest uppercase text-secondary">
              Consulta
            </p>
            <h2
              id={titleId}
              className="mt-1 font-headline-md text-headline-md text-on-surface"
            >
              {product.title}
            </h2>
          </div>
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

        <p className="mb-md font-body-md text-body-md text-on-surface-variant">
          Completá estos datos y te armamos el mensaje para WhatsApp.
        </p>

        <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1">
            <span className="font-label-caps text-label-caps tracking-widest uppercase text-on-surface-variant">
              Fecha que lo necesita
            </span>
            <input
              required
              type="date"
              min={todayIso()}
              value={neededBy}
              onChange={(event) => setNeededBy(event.target.value)}
              className={fieldClassName}
              style={{ width: "100%", minHeight: 44 }}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-label-caps text-label-caps tracking-widest uppercase text-on-surface-variant">
              Cantidad
            </span>
            <input
              required
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className={fieldClassName}
              style={{ width: "100%", minHeight: 44 }}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-label-caps text-label-caps tracking-widest uppercase text-on-surface-variant">
              Temática
            </span>
            <input
              required
              type="text"
              name="tematica"
              autoComplete="on"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Ej: cumpleaños, bosque, inicial"
              className={fieldClassName}
              style={{ width: "100%", minHeight: 44 }}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-label-caps text-label-caps tracking-widest uppercase text-on-surface-variant">
              Dirección
            </span>
            <input
              required
              type="text"
              autoComplete="street-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Calle, número, localidad"
              className={fieldClassName}
              style={{ width: "100%", minHeight: 44 }}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-label-caps text-label-caps tracking-widest uppercase text-on-surface-variant">
              Descripción
            </span>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Nombres, medidas, colores o cualquier detalle"
              className={fieldClassName}
              style={{
                width: "100%",
                minHeight: 96,
                paddingTop: 12,
                paddingBottom: 12,
                resize: "vertical",
              }}
            />
          </label>

          <WhatsAppButton type="submit" variant="primary" fullWidth>
            Enviar por WhatsApp
          </WhatsAppButton>
        </form>
      </div>
    </div>,
    document.body,
  );
}
