"use client";

import { useState, useSyncExternalStore, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { AddToCartModal } from "@/components/cart/AddToCartModal";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useCart } from "@/context/CartContext";
import { hasQuantityOffers } from "@/features/products/lib/quantity-prices";
import { hasVariants } from "@/features/products/lib/variants";
import type { Product } from "@/types/product";

export function AddToCartButton({
  product,
  compact = false,
  initialQuantity = 1,
  initialVariantDescription,
}: {
  product: Product;
  compact?: boolean;
  initialQuantity?: number;
  initialVariantDescription?: string;
}) {
  const [open, setOpen] = useState(false);
  const { items, addToCart, updateQuantity } = useCart();
  const productId = product.id ?? product.slug;
  const lines = items.filter((item) => item.id === productId);
  const quantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const usesChoices = hasQuantityOffers(product) || hasVariants(product);

  function addOne(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const preferred = lines.find((item) => !item.customNotes) ?? lines[0];
    if (!preferred) {
      addToCart(product, 1);
      return;
    }
    updateQuantity(preferred.id, preferred.quantity + 1, preferred.customNotes);
  }

  function removeOne(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const last = lines[lines.length - 1];
    if (!last) return;
    updateQuantity(last.id, last.quantity - 1, last.customNotes);
  }

  if (quantity > 0 && !usesChoices) {
    return (
      <div
        className={
          compact
            ? "inline-flex min-w-0 flex-1 items-center justify-between rounded-lg bg-primary-container text-on-primary-container"
            : "inline-flex items-center justify-between rounded-lg bg-primary-container text-on-primary-container"
        }
        style={{
          flex: compact ? 1 : undefined,
          minWidth: 0,
          width: compact ? "auto" : "100%",
          minHeight: compact ? 36 : 44,
          height: compact ? 36 : 44,
        }}
      >
        <button
          type="button"
          aria-label={
            quantity === 1 ? "Quitar del carrito" : "Quitar una unidad"
          }
          onClick={removeOne}
          className="inline-flex items-center justify-center"
          style={{ minWidth: compact ? 32 : 44, minHeight: compact ? 36 : 44 }}
        >
          <MaterialIcon
            name={quantity === 1 ? "delete" : "remove"}
            className={compact ? "text-sm" : ""}
          />
        </button>
        <span
          className={
            compact
              ? "min-w-5 text-center text-xs font-semibold"
              : "min-w-8 text-center font-label-caps text-label-caps tracking-widest"
          }
        >
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Agregar una unidad"
          onClick={addOne}
          className="inline-flex items-center justify-center"
          style={{ minWidth: compact ? 32 : 44, minHeight: compact ? 36 : 44 }}
        >
          <MaterialIcon name="add" className={compact ? "text-sm" : ""} />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
        className={
          compact
            ? "inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg bg-orange-200 p-2 text-xs font-semibold text-orange-950 hover:bg-orange-100"
            : "inline-flex items-center justify-center gap-1 rounded-lg bg-primary text-on-primary hover:opacity-90"
        }
        style={{
          flex: compact ? 1 : undefined,
          minWidth: 0,
          width: compact ? "auto" : "100%",
          minHeight: compact ? 36 : 44,
          height: compact ? 36 : undefined,
          padding: compact ? "8px 6px" : "0 16px",
        }}
      >
        <MaterialIcon
          name="add_shopping_cart"
          className={compact ? "text-sm" : ""}
        />
        <span
          className={
            compact
              ? "truncate text-xs font-semibold leading-none tracking-wide"
              : "font-label-caps text-label-caps tracking-widest uppercase"
          }
        >
          {compact ? "Agregar" : "Agregar al carrito"}
        </span>
      </button>
      <AddToCartModal
        product={open ? product : null}
        initialQuantity={initialQuantity}
        initialVariantDescription={initialVariantDescription}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const subscribeToNothing = () => () => {};

export function CartToast() {
  const { toast } = useCart();
  const isClient = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

  if (!isClient || !toast) return null;

  return createPortal(
    <div
      role="status"
      className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 96,
        transform: "translateX(-50%)",
        zIndex: 2147483647,
        whiteSpace: "nowrap",
      }}
    >
      {toast}
    </div>,
    document.body,
  );
}
