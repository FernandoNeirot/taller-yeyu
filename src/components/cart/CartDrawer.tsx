"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useCart } from "@/context/CartContext";
import { buildCartWhatsAppMessage } from "@/features/cart/whatsapp-message";
import type { ShippingOption } from "@/features/cart/types";
import { exceedsStandardMail } from "@/features/products/lib/logistics";
import { formatProductPrice } from "@/features/products/lib/format-price";
import {
  buildWhatsAppLink,
  getWhatsAppPhoneNumber,
} from "@/lib/whatsapp";

function checkoutItems(items: ReturnType<typeof useCart>["items"]) {
  return items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    customNotes: item.customNotes,
  }));
}

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotalPrice,
    itemCount,
  } = useCart();
  const titleId = useId();
  const [postalCode, setPostalCode] = useState("");
  const [locality, setLocality] = useState("");
  const [address, setAddress] = useState("");
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<
    ShippingOption["id"] | ""
  >("");
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [paying, setPaying] = useState(false);

  const shipping = options.find((option) => option.id === selectedShippingId) ?? null;
  const shippingPrice = shipping?.price ?? 0;
  const total = subtotalPrice + shippingPrice;
  const hasUnpricedItems = items.some((item) => item.price == null);
  const hasCustomizable = items.some((item) => item.customizable);
  const oversized = items.some((item) =>
    exceedsStandardMail(
      item.dimensions,
      (item.weightGrams ?? 0) * item.quantity,
    ),
  );

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) closeCart();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart, isOpen]);

  useEffect(() => {
    setOptions([]);
    setSelectedShippingId("");
    setQuoteError("");
  }, [items]);

  const summary = useMemo(
    () => ({
      items,
      subtotalPrice,
      shipping,
      postalCode,
      locality,
      address,
    }),
    [address, items, locality, postalCode, shipping, subtotalPrice],
  );

  async function quoteShipping() {
    setQuoting(true);
    setQuoteError("");
    setCheckoutError("");
    try {
      const response = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postalCode,
          items: checkoutItems(items),
        }),
      });
      const payload = (await response.json()) as {
        options?: ShippingOption[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error || "No se pudo cotizar el envío.");
      }
      const next = payload.options ?? [];
      setOptions(next);
      setSelectedShippingId(next[0]?.id ?? "");
    } catch (error) {
      setOptions([]);
      setSelectedShippingId("");
      setQuoteError(
        error instanceof Error ? error.message : "No se pudo cotizar el envío.",
      );
    } finally {
      setQuoting(false);
    }
  }

  async function payWithMercadoPago() {
    setPaying(true);
    setCheckoutError("");
    try {
      const response = await fetch("/api/mercadopago/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "mercadopago",
          items: checkoutItems(items),
          postalCode,
          shippingOptionId: selectedShippingId || undefined,
          locality,
          address,
        }),
      });
      const payload = (await response.json()) as {
        initPoint?: string;
        error?: string;
      };
      if (!response.ok || !payload.initPoint) {
        throw new Error(payload.error || "No se pudo iniciar Mercado Pago.");
      }
      window.location.assign(payload.initPoint);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar Mercado Pago.",
      );
      setPaying(false);
    }
  }

  async function consultWhatsApp() {
    setCheckoutError("");
    try {
      await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "whatsapp",
          items: checkoutItems(items),
          postalCode,
          shippingOptionId: selectedShippingId || undefined,
          locality,
          address,
        }),
      });
    } catch {
      // El pedido igual se consulta por WhatsApp.
    }

    const url = buildWhatsAppLink({
      phoneNumber: getWhatsAppPhoneNumber(),
      message: buildCartWhatsAppMessage(summary),
    });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        aria-hidden={!isOpen}
        onClick={closeCart}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 200ms ease",
          zIndex: 2147483646,
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-surface-container-lowest"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100dvh",
          width: "min(100vw, 420px)",
          zIndex: 2147483647,
          display: "flex",
          flexDirection: "column",
          pointerEvents: isOpen ? "auto" : "none",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: "-12px 0 40px rgba(0,0,0,0.45)",
        }}
      >
        <header
          className="flex items-center justify-between border-b border-outline-variant/30"
          style={{ padding: "12px 16px", minHeight: 64, flexShrink: 0 }}
        >
          <div>
            <h2 id={titleId} className="font-headline-md text-headline-md text-on-surface">
              Tu pedido
            </h2>
            <p className="font-body-md text-sm text-on-surface-variant">
              {itemCount === 0
                ? "El carrito está vacío"
                : `${itemCount} ${itemCount === 1 ? "pieza" : "piezas"}`}
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar carrito"
            onClick={closeCart}
            className="inline-flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-highest"
            style={{ minHeight: 44, minWidth: 44 }}
          >
            <MaterialIcon name="close" />
          </button>
        </header>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            padding: 16,
          }}
        >
          {items.length === 0 ? (
            <p className="font-body-md text-body-md text-on-surface-variant">
              Agregá piezas desde la galería para armar tu pedido.
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={`${item.id}::${item.customNotes}`}
                  className="rounded-xl border border-outline-variant/30 bg-surface-container"
                  style={{ padding: 12 }}
                >
                  <div className="flex" style={{ gap: 12 }}>
                    <div
                      className="relative overflow-hidden rounded-lg bg-surface-container-highest"
                      style={{ width: 72, height: 72, flexShrink: 0 }}
                    >
                      <Image
                        alt={item.title}
                        src={item.featuredImage}
                        fill
                        className="object-cover"
                        sizes="72px"
                        unoptimized
                      />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p className="font-semibold text-sm text-on-surface">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-on-surface-variant">
                        {item.specificationsDimensions ||
                          `${item.dimensions.lengthCm} × ${item.dimensions.widthCm} × ${item.dimensions.heightCm} cm`}
                        {" · "}
                        {item.weightGrams} g
                      </p>
                      {item.customNotes ? (
                        <p className="mt-1 text-[11px] text-secondary">
                          {item.customNotes}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm font-semibold text-primary">
                        {item.price != null
                          ? formatProductPrice(item.price * item.quantity)
                          : "A cotizar"}
                      </p>
                    </div>
                  </div>
                  <div
                    className="mt-3 flex items-center justify-between"
                    style={{ gap: 8 }}
                  >
                    <div className="inline-flex items-center rounded-lg bg-surface-container-highest">
                      <button
                        type="button"
                        aria-label="Quitar una unidad"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity - 1,
                            item.customNotes,
                          )
                        }
                        style={{ minWidth: 36, minHeight: 36 }}
                      >
                        <MaterialIcon name="remove" className="text-sm" />
                      </button>
                      <span className="min-w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Agregar una unidad"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity + 1,
                            item.customNotes,
                          )
                        }
                        style={{ minWidth: 36, minHeight: 36 }}
                      >
                        <MaterialIcon name="add" className="text-sm" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(item.id, item.customNotes)
                      }
                      className="text-xs text-error hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 ? (
            <section className="mt-6">
              <h3 className="font-label-caps text-label-caps tracking-widest text-secondary">
                Envío Andreani
              </h3>
              <p className="mt-1 text-xs text-on-surface-variant">
                El peso y el volumen se calculan con todos los productos del
                carrito. Cotizá acá antes de pagar o consultar por WhatsApp.
              </p>
              <div className="mt-2 flex" style={{ gap: 8 }}>
                <input
                  value={postalCode}
                  onChange={(event) =>
                    setPostalCode(event.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  inputMode="numeric"
                  placeholder="Código postal"
                  aria-label="Código postal"
                  className="rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 text-sm text-on-surface outline-none focus:border-primary"
                  style={{ flex: 1, minHeight: 44 }}
                />
                <button
                  type="button"
                  onClick={quoteShipping}
                  disabled={quoting || postalCode.length !== 4}
                  className="rounded-lg bg-surface-container-highest px-3 text-xs font-semibold text-on-surface disabled:opacity-50"
                  style={{ minHeight: 44 }}
                >
                  {quoting ? "Calculando…" : "Calcular envío"}
                </button>
              </div>
              <input
                value={locality}
                onChange={(event) => setLocality(event.target.value)}
                placeholder="Localidad (opcional)"
                className="mt-2 rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 text-sm text-on-surface outline-none focus:border-primary"
                style={{ width: "100%", minHeight: 40 }}
              />
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Dirección (opcional)"
                className="mt-2 rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 text-sm text-on-surface outline-none focus:border-primary"
                style={{ width: "100%", minHeight: 40 }}
              />

              {quoting ? (
                <div className="mt-3 space-y-2">
                  <div className="h-14 animate-pulse rounded-lg bg-surface-container-high" />
                  <div className="h-14 animate-pulse rounded-lg bg-surface-container-high" />
                </div>
              ) : null}

              {quoteError ? (
                <p className="mt-3 text-xs text-error">{quoteError}</p>
              ) : null}

              {options.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {options.map((option) => {
                    const selected = option.id === selectedShippingId;
                    return (
                      <label
                        key={option.id}
                        className={
                          selected
                            ? "flex cursor-pointer items-start gap-2 rounded-lg border border-primary bg-surface-container p-3"
                            : "flex cursor-pointer items-start gap-2 rounded-lg border border-outline-variant/30 bg-surface-container p-3"
                        }
                      >
                        <input
                          type="radio"
                          name="shipping"
                          checked={selected}
                          onChange={() => setSelectedShippingId(option.id)}
                          className="mt-1"
                        />
                        <span style={{ flex: 1 }}>
                          <span className="block text-sm font-semibold text-on-surface">
                            {option.label}
                          </span>
                          <span className="block text-[11px] text-on-surface-variant">
                            {option.description}
                            {option.estimatedDays
                              ? ` · ${option.estimatedDays}`
                              : ""}
                          </span>
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {formatProductPrice(option.price)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : null}

              {hasCustomizable ? (
                <p className="mt-3 text-xs text-secondary">
                  Hay piezas personalizables: el diseño puede requerir una
                  cotización especial.
                </p>
              ) : null}
              {oversized ? (
                <p className="mt-2 text-xs text-secondary">
                  Alguna pieza supera las medidas o el peso habitual de correo.
                  Andreani puede pedir un bulto especial.
                </p>
              ) : null}
            </section>
          ) : null}
        </div>

        {items.length > 0 ? (
          <footer
            className="border-t border-outline-variant/30 bg-surface-container"
            style={{ padding: 16, flexShrink: 0 }}
          >
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Subtotal</span>
              <span>
                {hasUnpricedItems
                  ? "A cotizar"
                  : formatProductPrice(subtotalPrice)}
              </span>
            </div>
            <div className="mt-1 flex justify-between text-sm text-on-surface-variant">
              <span>Envío Andreani</span>
              <span>
                {shipping
                  ? formatProductPrice(shippingPrice)
                  : postalCode
                    ? "Pendiente"
                    : "Sin cotizar"}
              </span>
            </div>
            <div className="mt-2 flex justify-between font-semibold text-on-surface">
              <span>Total a pagar</span>
              <span>
                {hasUnpricedItems ? "A cotizar" : formatProductPrice(total)}
              </span>
            </div>

            {checkoutError ? (
              <p className="mt-2 text-xs text-error">{checkoutError}</p>
            ) : null}

            <button
              type="button"
              onClick={payWithMercadoPago}
              disabled={paying || hasUnpricedItems || items.length === 0}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#009EE3] text-white hover:bg-[#0088c6] disabled:opacity-50"
              style={{ width: "100%", minHeight: 48 }}
            >
              {paying ? "Redirigiendo…" : "Pagar con Mercado Pago"}
            </button>
            <button
              type="button"
              onClick={consultWhatsApp}
              className="mt-2 inline-flex items-center justify-center rounded-xl border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
              style={{ width: "100%", minHeight: 44 }}
            >
              Consultar pedido por WhatsApp
            </button>
            <button
              type="button"
              onClick={clearCart}
              className="mt-2 w-full text-center text-xs text-on-surface-variant hover:underline"
            >
              Vaciar carrito
            </button>
          </footer>
        ) : null}
      </aside>
    </>,
    document.body,
  );
}
