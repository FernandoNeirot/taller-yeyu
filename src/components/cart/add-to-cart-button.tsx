"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AddToCartModal } from "@/components/cart/AddToCartModal";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types/product";

export function AddToCartButton({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

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
        onClose={() => setOpen(false)}
      />
    </>
  );
}

export function CartToast() {
  const { toast } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !toast) return null;

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
