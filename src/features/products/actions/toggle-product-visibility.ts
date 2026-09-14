"use server";

import { requireAdmin } from "@/features/admin/services/auth";
import { setProductActive } from "../services/get-products";
import type { Product } from "../types";

export type ToggleProductVisibilityState = {
  error?: string;
  product?: Product;
};

export async function toggleProductVisibilityAction(
  _prev: ToggleProductVisibilityState | null,
  formData: FormData,
): Promise<ToggleProductVisibilityState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const nextActive = String(formData.get("isActive") ?? "") === "true";

  if (!id) {
    return { error: "El producto no es válido." };
  }

  try {
    const product = await setProductActive(id, nextActive);
    return { product };
  } catch (error) {
    console.error("No se pudo cambiar la visibilidad del producto.", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo cambiar la visibilidad del producto.",
    };
  }
}
