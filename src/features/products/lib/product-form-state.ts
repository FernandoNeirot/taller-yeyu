import { moneyToNumber } from "@/components/ui/money-input";
import { topicLabel, type PowerSource, type Product } from "@/types/product";
import { formatProductPrice } from "./format-price";
import { normalizePackOptions, validatePackOptions } from "./packs";
import { slugify } from "./slug";
import { validateProductSpecs } from "./product-specs";

export type VariantFormRow = {
  id: string;
  description: string;
  price: string;
};

export type QuantityPriceFormRow = {
  id: string;
  quantity: string;
  price: string;
};

export type ProductFormState = {
  title: string;
  shortDescription: string;
  fullDescription: string;
  categories: string[];
  topics: string;
  dimensions: string;
  heightCm: string;
  widthCm: string;
  depthCm: string;
  diameterCm: string;
  finish: string;
  thickness: string;
  hasLighting: boolean;
  powerSource: PowerSource;
  customizable: boolean;
  hidden: boolean;
  price: string;
  packOptions: QuantityPriceFormRow[];
  quantityPrices: QuantityPriceFormRow[];
  variants: VariantFormRow[];
};

export type FormSectionId =
  | "basic"
  | "classify"
  | "measures"
  | "price"
  | "quote"
  | "photos";

export const defaultOpenSections: Record<FormSectionId, boolean> = {
  basic: true,
  classify: false,
  measures: false,
  price: false,
  quote: false,
  photos: false,
};

export const emptyProductForm: ProductFormState = {
  title: "",
  shortDescription: "",
  fullDescription: "",
  categories: [],
  topics: "",
  dimensions: "",
  heightCm: "",
  widthCm: "",
  depthCm: "",
  diameterCm: "",
  finish: "",
  thickness: "",
  hasLighting: false,
  powerSource: "ninguno",
  customizable: true,
  hidden: false,
  price: "",
  packOptions: [],
  quantityPrices: [],
  variants: [],
};

export function productId(product: Product) {
  return product.id ?? product.slug;
}

export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function newRowId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `row-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function newQuantityRow(): QuantityPriceFormRow {
  return { id: newRowId(), quantity: "", price: "" };
}

export function newVariantRow(): VariantFormRow {
  return { id: newRowId(), description: "", price: "" };
}

function measureToString(value: number | undefined) {
  return value != null ? String(value) : "";
}

export function productToForm(product: Product): ProductFormState {
  const specs = product.specifications;
  return {
    title: product.title,
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    categories: product.categories,
    topics: product.topics.map(topicLabel).join(", "),
    dimensions: specs.dimensions,
    heightCm: measureToString(specs.heightCm),
    widthCm: measureToString(specs.widthCm),
    depthCm: measureToString(specs.depthCm),
    diameterCm: measureToString(specs.diameterCm),
    finish: specs.finish,
    thickness: specs.thickness,
    hasLighting: specs.hasLighting,
    powerSource: specs.powerSource,
    customizable: specs.customizable,
    hidden: !product.isActive,
    price: product.price == null ? "" : String(product.price),
    packOptions: (product.packOptions ?? []).map((option) => ({
      id: newRowId(),
      quantity: String(option.quantity),
      price: String(option.price),
    })),
    quantityPrices: (product.quantityPrices ?? []).map((tier) => ({
      id: newRowId(),
      quantity: String(tier.quantity),
      price: String(tier.price),
    })),
    variants: (product.variants ?? []).map((option) => ({
      id: newRowId(),
      description: option.description,
      price: String(option.price),
    })),
  };
}

export function quantityPriceSummary(form: ProductFormState) {
  return form.quantityPrices
    .filter((row) => Number(row.quantity) > 0 && moneyToNumber(row.price) > 0)
    .map(
      (row) =>
        `${Number(row.quantity)} a ${formatProductPrice(moneyToNumber(row.price))}`,
    )
    .join(" · ");
}

export function packSummary(form: ProductFormState) {
  return form.packOptions
    .filter((row) => Number(row.quantity) > 0 && moneyToNumber(row.price) > 0)
    .map(
      (row) =>
        `x${Number(row.quantity)} ${formatProductPrice(moneyToNumber(row.price))}`,
    )
    .join(" · ");
}

export function variantSummary(form: ProductFormState) {
  return form.variants
    .filter((row) => row.description.trim() && moneyToNumber(row.price) > 0)
    .map(
      (row) =>
        `${row.description.trim()} ${formatProductPrice(moneyToNumber(row.price))}`,
    )
    .join(" · ");
}

// ── Validación ──────────────────────────────────────────────────────────

export type ProductFormErrorKey =
  | "title"
  | "fullDescription"
  | "categories"
  | "thickness"
  | "powerSource"
  | "heightCm"
  | "widthCm"
  | "depthCm"
  | "diameterCm"
  | "price"
  | "packOptions"
  | "quantityPrices"
  | "variants"
  | "photos";

export type ProductFormErrors = Partial<Record<ProductFormErrorKey, string>>;

export const errorSection: Record<ProductFormErrorKey, FormSectionId> = {
  title: "basic",
  fullDescription: "basic",
  thickness: "basic",
  powerSource: "basic",
  categories: "classify",
  heightCm: "measures",
  widthCm: "measures",
  depthCm: "measures",
  diameterCm: "measures",
  price: "price",
  packOptions: "price",
  quantityPrices: "price",
  variants: "price",
  photos: "photos",
};

const measureLabels = {
  heightCm: "El alto",
  widthCm: "El ancho",
  depthCm: "El profundo",
  diameterCm: "El diámetro",
} as const;

export function validateProductForm(
  form: ProductFormState,
  photoCount: number,
  /** Slugs de productos existentes que no se pueden repetir (vacío al editar). */
  takenSlugs: ReadonlySet<string> = new Set(),
): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (!form.title.trim()) {
    errors.title = "Completá el título.";
  } else if (takenSlugs.has(slugify(form.title))) {
    errors.title = "Ya existe un producto con ese título.";
  }
  if (!form.fullDescription.trim()) {
    errors.fullDescription = "Completá la descripción.";
  }
  if (form.categories.length === 0) {
    errors.categories = "Elegí al menos una categoría.";
  }

  const specs = validateProductSpecs(form);
  Object.assign(errors, specs.errors);

  for (const key of Object.keys(measureLabels) as (keyof typeof measureLabels)[]) {
    const raw = form[key].trim().replace(",", ".");
    if (!raw) continue;
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) {
      errors[key] = `${measureLabels[key]} tiene que ser un número mayor a 0.`;
    }
  }

  if (form.price && !(moneyToNumber(form.price) > 0)) {
    errors.price = "El precio tiene que ser mayor a 0.";
  }

  const incompletePack = form.packOptions.some((row) => {
    const hasQuantity = Number(row.quantity) > 0;
    const hasPrice = moneyToNumber(row.price) > 0;
    return hasQuantity !== hasPrice;
  });
  const packQuantities = form.packOptions
    .filter((row) => Number(row.quantity) > 0)
    .map((row) => Number(row.quantity));
  if (incompletePack) {
    errors.packOptions = "Completá cantidad y precio en cada pack.";
  } else if (new Set(packQuantities).size !== packQuantities.length) {
    errors.packOptions = "Hay dos packs con la misma cantidad.";
  } else {
    const packError = validatePackOptions(
      normalizePackOptions(
        form.packOptions.map((row) => ({
          quantity: Number(row.quantity),
          price: moneyToNumber(row.price),
        })),
      ) ?? [],
    );
    if (packError) errors.packOptions = packError;
  }

  const incompleteTier = form.quantityPrices.some((row) => {
    const hasQuantity = Number(row.quantity) > 0;
    const hasPrice = moneyToNumber(row.price) > 0;
    return hasQuantity !== hasPrice;
  });
  if (incompleteTier) {
    errors.quantityPrices = "Completá cantidad y precio en cada fila.";
  }

  const incompleteVariant = form.variants.some((row) => {
    const hasDescription = Boolean(row.description.trim());
    const hasPrice = moneyToNumber(row.price) > 0;
    return hasDescription !== hasPrice;
  });
  if (incompleteVariant) {
    errors.variants = "Completá descripción y precio en cada variante.";
  }

  if (photoCount === 0) errors.photos = "Agregá al menos una foto.";

  return errors;
}
