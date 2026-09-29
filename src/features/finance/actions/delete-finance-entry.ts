"use server";

import { requireAdmin } from "@/features/admin/services/auth";
import { deleteFamilyFinanceEntry } from "../services/family-finance";
import { deleteVentureFinanceEntry } from "../services/venture-finance";

export type DeleteFinanceEntryState = {
  error?: string;
  deletedId?: string;
};

export async function deleteFamilyEntryAction(
  _prev: DeleteFinanceEntryState | null,
  formData: FormData,
): Promise<DeleteFinanceEntryState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "El movimiento no es válido." };

  try {
    const deletedId = await deleteFamilyFinanceEntry(id);
    return { deletedId };
  } catch (error) {
    console.error("No se pudo eliminar el movimiento familiar.", error);
    return { error: "No se pudo eliminar el movimiento." };
  }
}

export async function deleteVentureEntryAction(
  _prev: DeleteFinanceEntryState | null,
  formData: FormData,
): Promise<DeleteFinanceEntryState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "El movimiento no es válido." };

  try {
    const deletedId = await deleteVentureFinanceEntry(id);
    return { deletedId };
  } catch (error) {
    console.error("No se pudo eliminar el movimiento de emprendimiento.", error);
    return { error: "No se pudo eliminar el movimiento." };
  }
}
