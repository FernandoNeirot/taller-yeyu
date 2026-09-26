"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoneyInput, moneyToNumber } from "@/components/ui/money-input";
import {
  buildOrderPath,
  type OrderDiscountType,
  type OrderSelection,
} from "@/features/cart/order-link";
import {
  catalogLineTotal,
  offeredLineTotal,
  orderDiscountAmount,
} from "@/features/cart/order-quote";
import { formatProductPrice } from "@/features/products/lib/format-price";
import type { ProductQuantityPrice } from "@/features/products/lib/quantity-prices";

export type OrderViewLine = {
  slug: string;
  title: string;
  href: string | null;
  image: string | null;
  variant: string;
  notes: string;
  dimensions: string;
  quantity: number;
  offer: number | null;
  unitPrice: number | null;
  quantityPrices: ProductQuantityPrice[];
  missing: boolean;
};

type OrderViewProps = {
  canEdit: boolean;
  lines: OrderViewLine[];
  postalCode: string;
  locality: string;
  address: string;
  shipping: string;
  discountType: OrderDiscountType;
  discountValue: number;
};

function clampQuantity(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
}

function clampPercent(value: string) {
  const parsed = Math.round(Number(value));
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.min(100, parsed);
}

export function OrderView({
  canEdit,
  lines,
  postalCode,
  locality,
  address,
  shipping,
  discountType: initialDiscountType,
  discountValue: initialDiscountValue,
}: OrderViewProps) {
  const router = useRouter();
  const [quantities, setQuantities] = useState(() => lines.map((line) => line.quantity));
  const [offers, setOffers] = useState(() =>
    lines.map((line) => (line.offer != null && line.offer > 0 ? String(line.offer) : "")),
  );
  const [discountType, setDiscountType] = useState<OrderDiscountType>(initialDiscountType);
  const [percent, setPercent] = useState(
    initialDiscountType === "porcentaje" && initialDiscountValue > 0
      ? String(initialDiscountValue)
      : "",
  );
  const [amount, setAmount] = useState(
    initialDiscountType === "monto" && initialDiscountValue > 0
      ? String(initialDiscountValue)
      : "",
  );
  const [notice, setNotice] = useState("");

  const destination = [locality, address].filter(Boolean).join(" — ");
  const discountValue = discountType === "monto" ? Math.round(moneyToNumber(amount)) : clampPercent(percent);

  const quoted = lines.map((line, index) => {
    const quantity = canEdit ? quantities[index] : line.quantity;
    const offer = canEdit
      ? Math.round(moneyToNumber(offers[index] ?? "")) || null
      : line.offer;
    const catalog = catalogLineTotal(line, quantity);
    const total = offeredLineTotal(catalog, offer && offer > 0 ? offer : null);
    return { ...line, quantity, offer: offer && offer > 0 ? offer : null, catalog, total };
  });

  const priced = quoted.filter((row) => row.total != null);
  const subtotal = priced.reduce((sum, row) => sum + (row.total ?? 0), 0);
  const unpriced = quoted.some((row) => row.total == null);
  const discount = orderDiscountAmount(subtotal, discountType, discountValue);
  const total = Math.max(0, subtotal - discount);
  const hasAdjustment = quoted.some((row) => row.offer != null) || discount > 0;

  function selection(): OrderSelection {
    return {
      lines: quoted.map((row) => ({
        slug: row.slug,
        quantity: row.quantity,
        variant: row.variant,
        notes: row.notes,
        offer: row.offer,
      })),
      postalCode,
      locality,
      address,
      shipping,
      discountType,
      discountValue,
    };
  }

  function offerUrl() {
    return new URL(buildOrderPath(selection()), window.location.origin).toString();
  }

  function offerMessage(url: string) {
    const productLines = quoted
      .map((row) => {
        const price = row.total != null ? formatProductPrice(row.total) : "a cotizar";
        const variant = row.variant ? ` (${row.variant})` : "";
        const notes = row.notes ? `\n   Notas: ${row.notes}` : "";
        return `• ${row.title}${variant} x${row.quantity} — ${price}${notes}`;
      })
      .join("\n");

    const discountLine =
      discount > 0
        ? discountType === "porcentaje"
          ? `Descuento: ${discountValue}% (−${formatProductPrice(discount)})`
          : `Descuento: −${formatProductPrice(discount)}`
        : "";

    const totalLine = unpriced && priced.length === 0
      ? "Total: a cotizar"
      : `Total: ${formatProductPrice(total)}`;

    return [
      "Hola! Te paso la oferta de tu pedido de Taller Yeyu.",
      productLines,
      [
        hasAdjustment && subtotal > 0 ? `Subtotal: ${formatProductPrice(subtotal)}` : "",
        discountLine,
        totalLine,
        unpriced && priced.length > 0 ? "Hay piezas sin precio publicado." : "",
      ]
        .filter(Boolean)
        .join("\n"),
      url,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  async function copyText(value: string, success: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(success);
    } catch {
      setNotice(value);
    }
  }

  async function copyLink() {
    const url = offerUrl();
    router.replace(buildOrderPath(selection()), { scroll: false });
    await copyText(url, "Enlace de la oferta copiado.");
  }

  async function copyMessage() {
    const url = offerUrl();
    router.replace(buildOrderPath(selection()), { scroll: false });
    await copyText(offerMessage(url), "Mensaje copiado. Pegalo en el chat del cliente.");
  }

  return (
    <>
      {canEdit ? (
        <p className="mt-4 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-on-surface">
          Estás logueado como administrador. Podés cambiar cantidades, cargar un precio de oferta y aplicar un descuento. Al copiar el enlace, el cliente ve la misma oferta.
        </p>
      ) : null}

      <ul className="mt-8 flex flex-col gap-4">
        {quoted.map((row, index) => (
          <li
            key={`${row.slug}-${index}`}
            className="flex gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4"
          >
            <div
              className="relative shrink-0 overflow-hidden rounded-xl bg-surface-container"
              style={{ width: 88, height: 88 }}
            >
              {row.image ? (
                <Image alt="" src={row.image} fill className="object-cover" sizes="88px" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              {row.href ? (
                <Link href={row.href} className="font-semibold text-on-surface hover:text-primary">
                  {row.title}
                </Link>
              ) : (
                <p className="font-semibold text-on-surface">{row.title}</p>
              )}

              {canEdit ? (
                <label className="mt-3 block text-sm text-on-surface-variant">
                  Cantidad
                  <input
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    value={quantities[index]}
                    onChange={(event) => {
                      const next = clampQuantity(Number(event.target.value));
                      setQuantities((current) =>
                        current.map((quantity, quantityIndex) =>
                          quantityIndex === index ? next : quantity,
                        ),
                      );
                    }}
                    className="mt-1 w-28 rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
                  />
                </label>
              ) : (
                <p className="mt-1 text-sm text-on-surface-variant">Cantidad: {row.quantity}</p>
              )}

              {row.variant ? <p className="mt-1 text-sm text-secondary">{row.variant}</p> : null}
              {row.notes ? (
                <p className="mt-1 text-sm text-on-surface-variant">Notas: {row.notes}</p>
              ) : null}
              {row.dimensions ? (
                <p className="mt-1 text-xs text-on-surface-variant">{row.dimensions}</p>
              ) : null}

              {canEdit ? (
                <label className="mt-3 block text-sm text-on-surface-variant">
                  Precio oferta de esta línea
                  <span className="mt-1 block">
                    <MoneyInput
                      value={offers[index] ?? ""}
                      onChange={(value) =>
                        setOffers((current) =>
                          current.map((offer, offerIndex) => (offerIndex === index ? value : offer)),
                        )
                      }
                      placeholder="Usar precio del catálogo"
                    />
                  </span>
                  <span className="mt-1 block text-xs">
                    Si lo completás, reemplaza el total de esta cantidad.
                    {row.catalog != null ? ` Catálogo: ${formatProductPrice(row.catalog)}.` : " Sin precio de catálogo."}
                  </span>
                </label>
              ) : null}

              <p className="mt-2 text-sm font-semibold text-primary">
                {row.total != null ? formatProductPrice(row.total) : "A cotizar"}
              </p>
              {row.offer != null && row.catalog != null && row.offer !== row.catalog ? (
                <p className="mt-1 text-xs text-on-surface-variant line-through">
                  {formatProductPrice(row.catalog)}
                </p>
              ) : null}
              {row.missing ? (
                <p className="mt-1 text-xs text-on-surface-variant">
                  Este producto ya no está en el catálogo.
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {canEdit ? (
        <fieldset className="mt-6 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
          <legend className="px-1 text-sm font-semibold text-on-surface">Descuento del pedido</legend>
          <div className="mt-3 flex gap-2">
            {(
              [
                ["porcentaje", "Porcentaje"],
                ["monto", "Monto"],
              ] as const
            ).map(([type, label]) => (
              <button
                key={type}
                type="button"
                onClick={() => setDiscountType(type)}
                className={
                  discountType === type
                    ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
                    : "rounded-full border border-outline-variant/40 px-4 py-2 text-sm text-on-surface"
                }
              >
                {label}
              </button>
            ))}
          </div>
          {discountType === "porcentaje" ? (
            <label className="mt-4 block text-sm text-on-surface-variant">
              Porcentaje
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                inputMode="numeric"
                value={percent}
                placeholder="0"
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, "");
                  if (!digits) {
                    setPercent("");
                    return;
                  }
                  setPercent(String(Math.min(100, Number(digits))));
                }}
                className="mt-1 w-28 rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
              />
            </label>
          ) : (
            <label className="mt-4 block max-w-xs text-sm text-on-surface-variant">
              Monto a descontar
              <span className="mt-1 block">
                <MoneyInput value={amount} onChange={setAmount} placeholder="$ 0" />
              </span>
            </label>
          )}
        </fieldset>
      ) : null}

      <div className="mt-6 rounded-2xl border border-outline-variant/30 bg-surface-container p-4">
        {hasAdjustment && subtotal > 0 ? (
          <p className="text-sm text-on-surface-variant">Subtotal {formatProductPrice(subtotal)}</p>
        ) : null}
        {discount > 0 ? (
          <p className="mt-1 text-sm text-secondary">
            Descuento{" "}
            {discountType === "porcentaje" ? `${discountValue}% · ` : ""}
            −{formatProductPrice(discount)}
          </p>
        ) : null}
        <p className="mt-2 font-headline-md text-headline-md text-on-surface">
          {priced.length === 0 ? "Total a cotizar" : formatProductPrice(total)}
        </p>
        {unpriced && priced.length > 0 ? (
          <p className="mt-1 text-sm text-secondary">Hay piezas sin precio publicado.</p>
        ) : null}
        {shipping ? (
          <p className="mt-2 text-sm text-on-surface-variant">Envío: {shipping}</p>
        ) : null}
        {postalCode ? (
          <p className="mt-1 text-sm text-on-surface-variant">Código postal: {postalCode}</p>
        ) : null}
        {destination ? (
          <p className="mt-1 text-sm text-on-surface-variant">Destino: {destination}</p>
        ) : null}
      </div>

      {canEdit ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={copyLink}
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-on-primary"
          >
            Copiar enlace de la oferta
          </button>
          <button
            type="button"
            onClick={copyMessage}
            className="rounded-full border border-outline-variant/40 px-5 py-3 text-sm font-semibold text-on-surface"
          >
            Copiar mensaje para el cliente
          </button>
        </div>
      ) : null}
      {notice ? (
        <p className="mt-3 break-all text-sm text-on-surface-variant">{notice}</p>
      ) : null}
    </>
  );
}
