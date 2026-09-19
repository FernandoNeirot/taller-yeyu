import type { Product } from "@/types/product";

export type ProductMeasures = {
  heightCm?: number;
  widthCm?: number;
  depthCm?: number;
  diameterCm?: number;
};

export const measureFields = [
  { key: "heightCm", label: "Alto", name: "heightCm" },
  { key: "widthCm", label: "Ancho", name: "widthCm" },
  { key: "depthCm", label: "Profundo", name: "depthCm" },
  { key: "diameterCm", label: "Diámetro", name: "diameterCm" },
] as const;

export function optionalMeasure(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function getProductMeasures(
  product: Pick<Product, "specifications">,
): ProductMeasures {
  const specs = product.specifications;
  return {
    heightCm: optionalMeasure(specs.heightCm),
    widthCm: optionalMeasure(specs.widthCm),
    depthCm: optionalMeasure(specs.depthCm),
    diameterCm: optionalMeasure(specs.diameterCm),
  };
}

export function formatCm(value: number) {
  return Number.isInteger(value) ? String(value) : String(value);
}

export function formatMeasuresSummary(
  measures: ProductMeasures,
  legacy = "",
) {
  const parts = measureFields
    .filter((field) => measures[field.key] != null)
    .map((field) => `${field.label} ${formatCm(measures[field.key]!)} cm`);

  return parts.join(" · ") || legacy.trim();
}

export function productMeasureRows(product: Product) {
  const measures = getProductMeasures(product);
  const rows = measureFields
    .filter((field) => measures[field.key] != null)
    .map((field) => ({
      label: field.label,
      value: `${formatCm(measures[field.key]!)} cm`,
    }));

  if (rows.length === 0 && product.specifications.dimensions.trim()) {
    return [
      { label: "Medidas", value: product.specifications.dimensions.trim() },
    ];
  }

  return rows;
}

export function formatProductDimensions(product: Product) {
  return formatMeasuresSummary(
    getProductMeasures(product),
    product.specifications.dimensions,
  );
}
