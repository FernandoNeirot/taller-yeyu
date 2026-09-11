"use server";

import { requireAdmin } from "@/features/admin/services/auth";
import { deleteProduct } from "../services/get-products";

export type DeleteProductState = {
  error?: string;
  deletedId?: string;
};

export async function deleteProductAction(
  _prev: DeleteProductState | null,
  formData: FormData,
): Promise<DeleteProductState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { error: "El producto no es válido." };
  }

  try {
    const deletedId = await deleteProduct(id);
    return { deletedId };
  } catch (error) {
    console.error("No se pudo eliminar el producto.", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el producto.",
    };
  }
}
