"use client";

import { useCart } from "@/context/CartContext";
import { MaterialIcon } from "@/components/ui/material-icon";
import type { Product } from "@/types/product";

export function AddToCartButton({
  product,
  quantity = 1,
  customNotes = "",
  compact = false,
  onAdded,
}: {
  product: Product;
  quantity?: number;
  customNotes?: string;
  compact?: boolean;
  onAdded?: () => void;
}) {
  const { addToCart } = useCart();

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        addToCart(product, quantity, customNotes);
        onAdded?.();
      }}
      className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary text-on-primary hover:opacity-90"
      style={{
        width: compact ? "100%" : "100%",
        minHeight: compact ? 32 : 44,
        padding: compact ? "0 8px" : "0 16px",
        flex: compact ? 1 : undefined,
      }}
    >
      <MaterialIcon name="add_shopping_cart" className={compact ? "text-sm" : ""} />
      <span
        className={
          compact
            ? "text-[11px] font-semibold tracking-wide"
            : "font-label-caps text-label-caps tracking-widest uppercase"
        }
      >
        {compact ? "Agregar" : "Agregar al carrito"}
      </span>
    </button>
  );
}
