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
import { uploadProductImageBuffers } from "../services/upload-product-images";
import type { Product } from "../types";
import { MAX_PRODUCT_IMAGES } from "../utils/compress-image";

export type SaveProductState = {
  error?: string;
  product?: Product;
};

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
    const input = {
      title,
      shortDescription,
      fullDescription,
      categories,
      topics: parseTopicList(String(formData.get("topics") ?? "")),
      dimensions: String(formData.get("dimensions") ?? ""),
      finish: String(formData.get("finish") ?? ""),
      customizable: formData.get("customizable") === "on",
      price: optionalNumber(formData.get("price")),
      isActive: formData.get("hidden") !== "on",
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
