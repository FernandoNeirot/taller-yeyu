import { formatProductPrice } from "../lib/format-price";
import type { ProductVariant } from "../lib/variants";

export function VariantPricePicker({
  options,
  description,
  onChange,
  tone = "page",
}: {
  options: ProductVariant[];
  description: string;
  onChange: (description: string) => void;
  tone?: "page" | "modal";
}) {
  if (options.length === 0) return null;

  return (
    <div className={tone === "modal" ? "mt-5" : "mt-4"}>
      <p
        className={
          tone === "modal"
            ? "text-xs font-semibold tracking-widest text-neutral-400 uppercase"
            : "font-label-caps text-label-caps tracking-widest text-on-surface-variant uppercase"
        }
      >
        Variante
      </p>
      <div className="mt-2 flex flex-col gap-2">
        {options.map((option) => {
          const selected = option.description === description;
          return (
            <button
              key={option.description}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.description)}
              className={
                tone === "modal"
                  ? selected
                    ? "flex items-center justify-between gap-3 rounded-xl bg-orange-200 px-4 text-left text-sm font-semibold text-orange-950"
                    : "flex items-center justify-between gap-3 rounded-xl bg-zinc-800 px-4 text-left text-sm font-semibold text-white"
                  : selected
                    ? "flex items-center justify-between gap-3 rounded-xl bg-primary px-4 text-left text-sm font-semibold text-on-primary"
                    : "flex items-center justify-between gap-3 rounded-xl border border-outline-variant/40 bg-surface-container px-4 text-left text-sm font-semibold text-on-surface"
              }
              style={{ minHeight: 44 }}
            >
              <span>{option.description}</span>
              <span>{formatProductPrice(option.price)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
