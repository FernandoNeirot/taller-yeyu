"use client";

import { useCart } from "@/context/CartContext";
import { MaterialIcon } from "@/components/ui/material-icon";

export function CartButton() {
  const { openCart, itemCount } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Abrir carrito${itemCount ? `, ${itemCount} productos` : ""}`}
      className="relative inline-flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-highest"
      style={{ minHeight: 44, minWidth: 44 }}
    >
      <MaterialIcon name="shopping_bag" />
      {itemCount > 0 ? (
        <span
          className="absolute inline-flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary"
          style={{
            top: 4,
            right: 4,
            minWidth: 18,
            height: 18,
            padding: "0 4px",
          }}
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </button>
  );
}
