"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/admin/services/auth";
import {
  createProduct,
  isCatalogCategory,
  parseTopicList,
  slugify,
  updateProduct,
} from "../services/get-products";
import { getMaterials } from "@/features/finance/services/venture-finance";
import {
  buildAccessoryCatalog,
  finalizeCostQuote,
  parseCostQuoteJson,
} from "../lib/cost-quote";
import { formatMeasuresSummary } from "../lib/measures";
import { normalizeQuantityPrices } from "../lib/quantity-prices";
import { normalizeVariants } from "../lib/variants";
import { uploadProductImageBuffers } from "../services/upload-product-images";
import type { Product } from "../types";
import { MAX_PRODUCT_IMAGES } from "../utils/compress-image";

export type SaveProductState = {
  error?: string;
  product?: Product;
};

function parseQuantityPrices(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

function optionalNumber(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function saveProductAction(
  _prev: SaveProductState | null,
  formData: FormData,
): Promise<SaveProductState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const fullDescription = String(formData.get("fullDescription") ?? "").trim();
  const categories = formData
    .getAll("categories")
    .map(String)
    .filter(isCatalogCategory);
  const existingImages = formData
    .getAll("existingImages")
    .map((value) => String(value))
    .filter(Boolean);
  const files = formData
    .getAll("imageBase64")
    .map((value) => String(value).trim())
    .filter(Boolean)
    .map((value) => Buffer.from(value, "base64"));

  if (!title || !fullDescription) {
    return { error: "Completá título y descripción." };
  }

  if (categories.length === 0) {
    return { error: "Elegí al menos una categoría." };
  }

  if (existingImages.length + files.length > MAX_PRODUCT_IMAGES) {
    return { error: `Podés tener como máximo ${MAX_PRODUCT_IMAGES} fotos.` };
  }

  if (existingImages.length + files.length === 0) {
    return { error: "Agregá al menos una foto." };
  }

  try {
    const uploaded = await uploadProductImageBuffers(
      files,
      slugify(title) || "producto",
    );
    const allImages = [...existingImages, ...uploaded].slice(
      0,
      MAX_PRODUCT_IMAGES,
    );
    const heightCm = optionalNumber(formData.get("heightCm"));
    const widthCm = optionalNumber(formData.get("widthCm"));
    const depthCm = optionalNumber(formData.get("depthCm"));
    const diameterCm = optionalNumber(formData.get("diameterCm"));
    const accessories = buildAccessoryCatalog(await getMaterials());
    const costQuote = finalizeCostQuote(
      parseCostQuoteJson(formData.get("costQuote")) ?? {},
      accessories,
    );
    const input = {
      title,
      shortDescription,
      fullDescription,
      categories,
      topics: parseTopicList(String(formData.get("topics") ?? "")),
      heightCm,
      widthCm,
      depthCm,
      diameterCm,
      dimensions: formatMeasuresSummary(
        {
          heightCm: heightCm ?? undefined,
          widthCm: widthCm ?? undefined,
          depthCm: depthCm ?? undefined,
          diameterCm: diameterCm ?? undefined,
        },
        String(formData.get("dimensions") ?? ""),
      ),
      finish: String(formData.get("finish") ?? ""),
      customizable: formData.get("customizable") === "on",
      price: optionalNumber(formData.get("price")),
      quantityPrices: normalizeQuantityPrices(
        parseQuantityPrices(formData.get("quantityPrices")),
      ),
      variants: normalizeVariants(parseQuantityPrices(formData.get("variants"))),
      isActive: formData.get("hidden") !== "on",
      costQuote,
    };

    const product = id
      ? await updateProduct(id, input, allImages)
      : await createProduct(input, allImages);

    revalidatePath("/", "layout");
    revalidatePath("/galeria");

    return { product };
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
