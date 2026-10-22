import { packOptionLabel } from "../lib/packs";
import type { ProductQuantityPrice } from "../lib/quantity-prices";

export function QuantityPricePicker({
  options,
  quantity,
  onChange,
  variant = "page",
  packs = false,
}: {
  options: ProductQuantityPrice[];
  quantity: number;
  onChange: (quantity: number) => void;
  variant?: "page" | "modal";
  /** Producto de venta por packs: las opciones se muestran como "Pack x10". */
  packs?: boolean;
}) {
  if (options.length === 0) return null;

  return (
    <div className={variant === "modal" ? "mt-5" : "mt-4"}>
      <p
        className={
          variant === "modal"
            ? "text-xs font-semibold tracking-widest text-on-surface-variant uppercase"
            : "font-label-caps text-label-caps tracking-widest text-on-surface-variant uppercase"
        }
      >
        {packs ? "Formato" : "Cantidad"}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.quantity === quantity;
          return (
            <button
              key={option.quantity}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.quantity)}
              className={
                variant === "modal"
                  ? selected
                    ? "rounded-xl bg-orange-200 px-4 text-sm font-semibold text-orange-950"
                    : "rounded-xl bg-surface-container-high px-4 text-sm font-semibold text-on-surface"
                  : selected
                    ? "rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary"
                    : "rounded-xl border border-outline-variant/40 bg-surface-container px-4 text-sm font-semibold text-on-surface"
              }
              style={{ minHeight: 44 }}
            >
              {packs ? packOptionLabel(option.quantity) : option.quantity}
            </button>
          );
        })}
      </div>
    </div>
  );
}
