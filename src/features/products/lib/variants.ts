export type ProductVariant = {
  description: string;
  price: number;
};

function toPositiveNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export function normalizeVariants(value: unknown): ProductVariant[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const byDescription = new Map<string, ProductVariant>();
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as { description?: unknown; price?: unknown };
    const description = String(row.description ?? "").trim();
    const price = toPositiveNumber(row.price);
    if (!description || price == null) continue;
    byDescription.set(description.toLocaleLowerCase("es"), { description, price });
  }

  if (byDescription.size === 0) return undefined;
  return [...byDescription.values()];
}

export function hasVariants(product: { variants?: ProductVariant[] }) {
  return (normalizeVariants(product.variants)?.length ?? 0) > 0;
}
