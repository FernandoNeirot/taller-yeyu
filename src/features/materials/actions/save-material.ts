"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/admin/services/auth";
import { isMeasureType, type Material } from "@/types/material";
import {
  createMaterial,
  deleteMaterial,
  updateMaterial,
} from "../services/materials";

export type SaveMaterialState = {
  error?: string;
  material?: Material;
};

export type DeleteMaterialState = {
  error?: string;
  deletedId?: string;
};

function parseNumber(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : NaN;
}

export async function saveMaterialAction(
  _prev: SaveMaterialState | null,
  formData: FormData,
): Promise<SaveMaterialState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const measureType = String(formData.get("measureType") ?? "");
  const totalCost = parseNumber(formData.get("totalCost"));
  const totalUnits = parseNumber(formData.get("totalUnits"));

  if (!name) return { error: "Poné un nombre al material." };
  if (!isMeasureType(measureType)) return { error: "Elegí cómo se mide el material." };
  if (!(totalCost >= 0)) return { error: "El costo total no es válido." };
  if (!(totalUnits > 0)) return { error: "Las unidades totales deben ser mayores a 0." };

  try {
    const input = { name, measureType, totalCost, totalUnits };
    const material = id
      ? await updateMaterial(id, input)
      : await createMaterial(input);
    revalidatePath("/admin/materiales");
    return { material };
  } catch (error) {
    console.error("No se pudo guardar el material.", error);
    return { error: "No se pudo guardar el material en Firebase." };
  }
}

export async function deleteMaterialAction(
  _prev: DeleteMaterialState | null,
  formData: FormData,
): Promise<DeleteMaterialState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "El material no es válido." };

  try {
    const deletedId = await deleteMaterial(id);
    revalidatePath("/admin/materiales");
    return { deletedId };
  } catch (error) {
    console.error("No se pudo eliminar el material.", error);
    return { error: "No se pudo eliminar el material." };
  }
}
