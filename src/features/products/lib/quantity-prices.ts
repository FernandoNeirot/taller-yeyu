export type ProductQuantityPrice = {
  quantity: number;
  price: number;
};

function toPositiveNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export function normalizeQuantityPrices(
  value: unknown,
): ProductQuantityPrice[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const byQuantity = new Map<number, number>();
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as { quantity?: unknown; price?: unknown };
    const quantity = toPositiveNumber(row.quantity);
    const price = toPositiveNumber(row.price);
    if (quantity == null || price == null) continue;
    byQuantity.set(Math.floor(quantity), price);
  }

  if (byQuantity.size === 0) return undefined;

  return [...byQuantity.entries()]
    .map(([quantity, price]) => ({ quantity, price }))
    .sort((a, b) => a.quantity - b.quantity);
}

export function purchaseOptions(product: {
  price?: number;
  quantityPrices?: ProductQuantityPrice[];
}) {
  const tiers = normalizeQuantityPrices(product.quantityPrices) ?? [];
  const options = [...tiers];
  if (
    product.price != null &&
    product.price > 0 &&
    !options.some((option) => option.quantity === 1)
  ) {
    options.push({ quantity: 1, price: product.price });
  }
  return options.sort((a, b) => a.quantity - b.quantity);
}

export function hasQuantityOffers(product: {
  quantityPrices?: ProductQuantityPrice[];
}) {
  return (normalizeQuantityPrices(product.quantityPrices)?.length ?? 0) > 0;
}

export function priceForQuantity(
  options: ProductQuantityPrice[],
  quantity: number,
) {
  return options.find((option) => option.quantity === quantity) ?? null;
}

export function adjacentQuantity(
  options: ProductQuantityPrice[],
  current: number,
  direction: -1 | 1,
) {
  const sorted = [...options].sort((a, b) => a.quantity - b.quantity);
  if (sorted.length === 0) return null;
  if (direction > 0) {
    return sorted.find((option) => option.quantity > current)?.quantity ?? null;
  }
  const previous = [...sorted]
    .reverse()
    .find((option) => option.quantity < current);
  return previous?.quantity ?? null;
}

export function lowestOfferPrice(product: {
  price?: number;
  quantityPrices?: ProductQuantityPrice[];
}) {
  const options = purchaseOptions(product);
  if (options.length === 0) return null;
  return options.reduce((lowest, option) =>
    option.price < lowest.price ? option : lowest,
  );
}
