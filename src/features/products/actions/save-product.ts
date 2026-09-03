"use server";

import { requireAdmin } from "@/features/admin/services/auth";
import {
  createProduct,
  isProductCategory,
  slugify,
  updateProduct,
} from "../services/get-products";
import { uploadProductImageBuffers } from "../services/upload-product-images";
import type { Product } from "../types";

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
  const description = String(formData.get("description") ?? "").trim();
  const category = formData.get("category");
  const existingImages = formData
    .getAll("existingImages")
    .map((value) => String(value))
    .filter(Boolean);
  const files = formData
    .getAll("imageBase64")
    .map((value) => String(value).trim())
    .filter(Boolean)
    .map((value) => Buffer.from(value, "base64"));

  if (!title || !description) {
    return { error: "Completá título y descripción." };
  }

  if (!isProductCategory(category)) {
    return { error: "Seleccioná una categoría válida." };
  }

  const images = [...existingImages];
  if (images.length + files.length > 3) {
    return { error: "Podés tener como máximo 3 fotos." };
  }

  if (images.length + files.length === 0) {
    return { error: "Agregá al menos una foto." };
  }

  try {
    const uploaded = await uploadProductImageBuffers(
      files,
      slugify(title) || "producto",
    );
    const allImages = [...images, ...uploaded].slice(0, 3);
    const input = {
      title,
      description,
      category,
      tag: String(formData.get("tag") ?? ""),
      alt: String(formData.get("alt") ?? ""),
      material: String(formData.get("material") ?? "Madera"),
      finish: String(formData.get("finish") ?? ""),
      customizable: formData.get("customizable") === "on",
      featured: formData.get("featured") === "on",
      available: formData.get("available") === "on",
      stock: optionalNumber(formData.get("stock")),
      price: optionalNumber(formData.get("price")),
      instagramUrl: String(formData.get("instagramUrl") ?? ""),
      mercadoLibreUrl: String(formData.get("mercadoLibreUrl") ?? ""),
    };

    const product = id
      ? await updateProduct(id, input, allImages)
      : await createProduct(input, allImages);

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
