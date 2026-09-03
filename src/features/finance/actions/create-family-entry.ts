"use server";

import { requireAdmin } from "@/features/admin/services/auth";
import {
  createFamilyFinanceEntry,
  normalizeFamilyFinanceInput,
  updateFamilyFinanceEntry,
} from "../services/family-finance";
import type { FamilyFinanceEntry, MovementType } from "../types";

export type SaveFamilyEntryState = {
  error?: string;
  entry?: FamilyFinanceEntry;
};

function isMovementType(value: FormDataEntryValue | null): value is MovementType {
  return value === "ingreso" || value === "egreso";
}

export async function saveFamilyEntryAction(
  _prev: SaveFamilyEntryState | null,
  formData: FormData,
): Promise<SaveFamilyEntryState> {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const movementType = formData.get("movementType");
  const totalAmount = Number(formData.get("totalAmount"));
  const paidAmount = Number(formData.get("paidAmount") || 0);
  const isPaid = formData.get("isPaid") === "on";

  if (!date || !category || !description) {
    return { error: "Completá fecha, categoría y descripción." };
  }

  if (!isMovementType(movementType)) {
    return { error: "Seleccioná si es ingreso o egreso." };
  }

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    return { error: "El monto total debe ser mayor a 0." };
  }

  if (!Number.isFinite(paidAmount) || paidAmount < 0) {
    return {
      error:
        movementType === "ingreso"
          ? "El monto cobrado no es válido."
          : "El monto pagado no es válido.",
    };
  }

  const input = normalizeFamilyFinanceInput({
    date,
    category,
    description,
    movementType,
    totalAmount,
    paidAmount,
    isPaid,
  });

  try {
    const entry = id
      ? await updateFamilyFinanceEntry(id, input)
      : await createFamilyFinanceEntry(input, user);

    return { entry };
  } catch (error) {
    console.error("No se pudo guardar el movimiento familiar.", error);
    return { error: "No se pudo guardar el movimiento en Firebase." };
  }
}
