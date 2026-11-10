"use server";

import { requireAdmin } from "@/features/admin/services/auth";
import { deleteQuote } from "../services/quotes";

export type DeleteQuoteState = {
  error?: string;
  deletedId?: string;
};

export async function deleteQuoteAction(
  _prev: DeleteQuoteState | null,
  formData: FormData,
): Promise<DeleteQuoteState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { error: "La cotización no es válida." };
  }

  try {
    const deletedId = await deleteQuote(id);
    return { deletedId };
  } catch (error) {
    console.error("No se pudo eliminar la cotización.", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la cotización.",
    };
  }
}
