import type { ProductPackOption } from "@/types/product-pricing";
import { normalizeQuantityPrices } from "./quantity-prices";

export type { ProductPackOption };

/** Limpia y ordena las opciones por cantidad (descarta filas inválidas y repetidas). */
export function normalizePackOptions(
  value: unknown,
): ProductPackOption[] | undefined {
  return normalizeQuantityPrices(value);
}

/** Un producto con opciones de pack se vende solo por packs. */
export function hasPackOptions(product?: {
  packOptions?: ProductPackOption[];
}) {
  return (normalizePackOptions(product?.packOptions)?.length ?? 0) > 0;
}

/** "Pack x20" */
export function packOptionLabel(quantity: number) {
  return `Pack x${quantity}`;
}

/** "Packs x10 a x30" / "Pack x10" */
export function packRangeLabel(options: ProductPackOption[]) {
  if (options.length === 0) return "";
  const first = options[0].quantity;
  const last = options[options.length - 1].quantity;
  return first === last ? packOptionLabel(first) : `Packs x${first} a x${last}`;
}

export type PackPricing = ProductPackOption & {
  /** Precio por unidad de este pack. */
  unitPrice: number;
  /** Descuento (0–100) frente al precio por unidad del pack más chico. */
  discountPercent: number;
};

/**
 * Precio por unidad y descuento de cada opción, tomando como base la opción
 * más chica. Las opciones tienen que venir normalizadas (ordenadas por cantidad).
 */
export function packPricing(options: ProductPackOption[]): PackPricing[] {
  if (options.length === 0) return [];
  const base = options[0];
  const baseUnit = base.price / base.quantity;

  return options.map((option) => {
    const unitPrice = option.price / option.quantity;
    const raw = baseUnit > 0 ? (1 - unitPrice / baseUnit) * 100 : 0;
    return {
      ...option,
      unitPrice,
      discountPercent: Math.max(0, Math.round(raw * 10) / 10),
    };
  });
}

/** Precio con hasta 2 decimales (una unidad de un pack no siempre es entera). */
export function formatUnitPrice(price: number) {
  return price.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatDiscount(percent: number) {
  return `${percent.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`;
}

/** "Llevando x20 pagás $1.100 por unidad (Ahorrás 8,3%)" */
export function packSavingsText(option: PackPricing) {
  const base = `Llevando x${option.quantity} pagás ${formatUnitPrice(option.unitPrice)} por unidad`;
  return option.discountPercent > 0
    ? `${base} (Ahorrás ${formatDiscount(option.discountPercent)})`
    : base;
}

/**
 * Valida las opciones tal como las cargó el admin. Devuelve el mensaje de
 * error o undefined. Un pack más grande no puede costar menos en total.
 */
export function validatePackOptions(
  options: ProductPackOption[],
): string | undefined {
  for (let index = 1; index < options.length; index += 1) {
    if (options[index].price <= options[index - 1].price) {
      return "Un pack más grande tiene que costar más que uno más chico.";
    }
  }
  return undefined;
}
