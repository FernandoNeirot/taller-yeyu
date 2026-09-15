"use client";

import { useCart } from "@/context/CartContext";
import { MaterialIcon } from "@/components/ui/material-icon";

export function CartButton({
  variant = "icon",
}: {
  variant?: "icon" | "nav";
}) {
  const { openCart, itemCount } = useCart();
  const label = itemCount
    ? `Abrir carrito, ${itemCount} ${itemCount === 1 ? "producto" : "productos"}`
    : "Abrir carrito";

  if (variant === "nav") {
    return (
      <button
        type="button"
        onClick={openCart}
        aria-label={label}
        className="flex flex-col items-center justify-center text-on-surface-variant pt-2 hover:bg-surface-container-high/50 active:scale-90"
        style={{ width: "20%", borderTop: "2px solid transparent" }}
      >
        <span className="relative mb-1 inline-flex">
          <MaterialIcon name="shopping_bag" filled={itemCount > 0} />
          {itemCount > 0 ? (
            <span
              className="absolute inline-flex items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white"
              style={{
                top: -6,
                right: -10,
                minWidth: 16,
                height: 16,
                padding: "0 4px",
              }}
            >
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          ) : null}
        </span>
        <span className="font-label-caps text-[10px] tracking-wider">
          CARRITO
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={label}
      className="relative inline-flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-highest"
      style={{ minHeight: 44, minWidth: 44 }}
    >
      <MaterialIcon name="shopping_bag" filled={itemCount > 0} />
      {itemCount > 0 ? (
        <span
          className="absolute inline-flex items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white"
          style={{
            top: 2,
            right: 2,
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
