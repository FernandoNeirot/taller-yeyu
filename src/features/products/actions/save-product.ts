"use server";

import { requireAdmin } from "@/features/admin/services/auth";
import { getMaterials } from "@/features/finance/services/venture-finance";
import { buildMaterialCatalog } from "@/features/quotes/types";
import { isPowerSource } from "@/types/product";
import { finalizeCostQuote, parseCostQuoteJson } from "../lib/cost-quote";
import { formatMeasuresSummary } from "../lib/measures";
import { normalizePackOptions, validatePackOptions } from "../lib/packs";
import { validateProductSpecs } from "../lib/product-specs";
import { normalizeQuantityPrices } from "../lib/quantity-prices";
import { normalizeVariants } from "../lib/variants";
import {
  createProduct,
  isCatalogCategory,
  productSlugExists,
  parseTopicList,
  slugify,
  updateProduct,
} from "../services/get-products";
import { uploadProductImageBuffers } from "../services/upload-product-images";
import type { Product, ProductInput } from "../types";
import { MAX_PRODUCT_IMAGES } from "../utils/compress-image";

export type SaveProductState = {
  error?: string;
  product?: Product;
  /** Se guardó con "Guardar y crear otro": el formulario sigue abierto y vacío. */
  createAnother?: boolean;
};

const measureFields = [
  { name: "heightCm", label: "El alto" },
  { name: "widthCm", label: "El ancho" },
  { name: "depthCm", label: "El profundo" },
  { name: "diameterCm", label: "El diámetro" },
] as const;

function parseJsonField(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

/** Vacío → null; número > 0 → número; cualquier otra cosa → NaN (inválido). */
function parsePositive(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim().replace(",", ".");
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : Number.NaN;
}

type ParsedForm =
  | { error: string }
  | { error?: undefined; input: ProductInput };

/** Lee y valida el FormData completo. No tiene efectos secundarios. */
function parseProductForm(formData: FormData): ParsedForm {
  const title = String(formData.get("title") ?? "").trim();
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const fullDescription = String(formData.get("fullDescription") ?? "").trim();

  if (!title || !fullDescription) {
    return { error: "Completá título y descripción." };
  }

  // Categorías: todas tienen que existir en el catálogo vigente.
  const submittedCategories = [
    ...new Set(formData.getAll("categories").map(String)),
  ];
  const categories = submittedCategories.filter(isCatalogCategory);
  if (categories.length !== submittedCategories.length) {
    return { error: "Hay una categoría que no es válida." };
  }
  if (categories.length === 0) {
    return { error: "Elegí al menos una categoría." };
  }

  // Medidas: opcionales, pero si vienen tienen que ser números > 0.
  const measures: Partial<Record<(typeof measureFields)[number]["name"], number>> =
    {};
  for (const field of measureFields) {
    const value = parsePositive(formData.get(field.name));
    if (value !== null && Number.isNaN(value)) {
      return { error: `${field.label} tiene que ser un número mayor a 0.` };
    }
    if (value !== null) measures[field.name] = value;
  }

  const price = parsePositive(formData.get("price"));
  if (price !== null && Number.isNaN(price)) {
    return { error: "El precio tiene que ser un número mayor a 0." };
  }

  // Packs: filas completas, sin cantidades repetidas y con precio creciente.
  const rawPacks = parseJsonField(formData.get("packOptions"));
  const packOptions = normalizePackOptions(rawPacks) ?? [];
  if (Array.isArray(rawPacks) && rawPacks.length !== packOptions.length) {
    return { error: "Revisá los packs: hay filas incompletas o repetidas." };
  }
  const packError = validatePackOptions(packOptions);
  if (packError) return { error: packError };

  // Luz, alimentación y espesor.
  const rawPowerSource = String(formData.get("powerSource") ?? "").trim();
  if (rawPowerSource && !isPowerSource(rawPowerSource)) {
    return { error: "La alimentación no es válida." };
  }
  const powerSource = isPowerSource(rawPowerSource) ? rawPowerSource : "ninguno";
  const hasLighting = formData.get("hasLighting") === "on";
  const specs = validateProductSpecs({
    thickness: String(formData.get("thickness") ?? ""),
    hasLighting,
    powerSource,
  });
  const specsError = specs.errors.thickness ?? specs.errors.powerSource;
  if (specsError) return { error: specsError };

  return {
    input: {
      title,
      shortDescription,
      fullDescription,
      categories,
      topics: parseTopicList(String(formData.get("topics") ?? "")),
      heightCm: measures.heightCm ?? null,
      widthCm: measures.widthCm ?? null,
      depthCm: measures.depthCm ?? null,
      diameterCm: measures.diameterCm ?? null,
      dimensions: formatMeasuresSummary(
        measures,
        String(formData.get("dimensions") ?? ""),
      ),
      finish: String(formData.get("finish") ?? ""),
      thickness: specs.thickness,
      hasLighting,
      powerSource,
      customizable: formData.get("customizable") === "on",
      price,
      packOptions,
      quantityPrices: normalizeQuantityPrices(
        parseJsonField(formData.get("quantityPrices")),
      ),
      variants: normalizeVariants(parseJsonField(formData.get("variants"))),
      isActive: formData.get("hidden") !== "on",
    },
  };
}

export async function saveProductAction(
  _prev: SaveProductState | null,
  formData: FormData,
): Promise<SaveProductState> {
  // Siempre primero: sin sesión de admin no se lee ni se valida nada.
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const parsed = parseProductForm(formData);
  if (parsed.error !== undefined) return { error: parsed.error };

  const existingImages = formData
    .getAll("existingImages")
    .map((value) => String(value))
    .filter(Boolean);
  const files = formData
    .getAll("imageBase64")
    .map((value) => String(value).trim())
    .filter(Boolean)
    .map((value) => Buffer.from(value, "base64"));

  if (existingImages.length + files.length > MAX_PRODUCT_IMAGES) {
    return { error: `Podés tener como máximo ${MAX_PRODUCT_IMAGES} fotos.` };
  }

  if (existingImages.length + files.length === 0) {
    return { error: "Agregá al menos una foto." };
  }

  // Antes de subir fotos: si el título ya existe, no hace falta gastar tiempo ni Storage.
  if (!id && (await productSlugExists(slugify(parsed.input.title)))) {
    return { error: "Ya existe un producto con ese título." };
  }

  try {
    const uploaded = await uploadProductImageBuffers(
      files,
      slugify(parsed.input.title) || "producto",
    );
    const allImages = [...existingImages, ...uploaded].slice(
      0,
      MAX_PRODUCT_IMAGES,
    );
    const accessories = buildMaterialCatalog(await getMaterials());
    const input: ProductInput = {
      ...parsed.input,
      costQuote: finalizeCostQuote(
        parseCostQuoteJson(formData.get("costQuote")) ?? {},
        accessories,
      ),
    };

    // createProduct / updateProduct invalidan la caché del catálogo
    // (updateTag) y revalidan /, /galeria, /producto y /admin/productos.
    const product = id
      ? await updateProduct(id, input, allImages)
      : await createProduct(input, allImages);

    return { product, createAnother: formData.get("intent") === "another" };
  } catch (error) {
    console.error("No se pudo guardar el producto.", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo guardar el producto.",
    };
  }
}
