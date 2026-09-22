"use server";

import { requireAdmin } from "@/features/admin/services/auth";
import {
  createAccessoryMaterials,
  createPaintMaterials,
  createVentureFinanceEntry,
  createWoodMaterials,
  normalizeVentureFinanceInput,
  updateVentureFinanceEntry,
} from "../services/venture-finance";
import type {
  AccessoryMaterialInput,
  MaterialSubcategory,
  MovementType,
  PaintMaterialInput,
  VentureFinanceEntry,
  WoodMaterialInput,
} from "../types";

export type SaveVentureEntryState = {
  error?: string;
  entry?: VentureFinanceEntry;
};

function isMovementType(value: FormDataEntryValue | null): value is MovementType {
  return value === "ingreso" || value === "egreso";
}

function parseJsonArray<T>(raw: FormDataEntryValue | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw));
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export async function saveVentureEntryAction(
  _prev: SaveVentureEntryState | null,
  formData: FormData,
): Promise<SaveVentureEntryState> {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const subcategory = String(formData.get("subcategory") ?? "").trim();
  let description = String(formData.get("description") ?? "").trim();
  const movementType = formData.get("movementType");
  let totalAmount = Number(formData.get("totalAmount"));
  let paidAmount = Number(formData.get("paidAmount") || 0);
  const isPaid = formData.get("isPaid") === "on";

  if (!date || !category) {
    return { error: "Completá fecha y categoría." };
  }

  if (!isMovementType(movementType)) {
    return { error: "Seleccioná si es ingreso o egreso." };
  }

  if (category === "Materiales" && !subcategory) {
    return { error: "Seleccioná subcategoría de materiales." };
  }

  const woods =
    category === "Materiales" && !id && subcategory === "maderas"
      ? parseJsonArray<WoodMaterialInput>(formData.get("woodItems")).filter(
          (item) =>
            item.name?.trim() &&
            Number(item.widthCm) > 0 &&
            Number(item.lengthCm) > 0 &&
            Number(item.price) > 0,
        )
      : [];
  const paints =
    category === "Materiales" && !id && subcategory === "pinturas"
      ? parseJsonArray<PaintMaterialInput>(formData.get("paintItems")).filter(
          (item) =>
            item.color?.trim() &&
            Number(item.quantity) > 0 &&
            Number(item.weightGrams) > 0,
        )
      : [];
  const accessories =
    category === "Materiales" && !id && subcategory === "accesorios"
      ? (parseJsonArray<AccessoryMaterialInput>(
          formData.get("accessoryItems"),
        ).filter(
          (item) =>
            item.name?.trim() &&
            (item.measureType === "unidad" ||
              item.measureType === "centimetro") &&
            Number(item.quantity) > 0 &&
            Number(item.totalPrice) > 0,
        ) as AccessoryMaterialInput[])
      : [];

  if (category === "Materiales" && !id) {
    if (subcategory === "maderas") {
      if (woods.length === 0) {
        return {
          error: "Agregá al menos una madera con nombre, ancho, largo y precio.",
        };
      }
      description = woods.map((item) => item.name.trim()).join(", ");
      totalAmount = woods.reduce((sum, item) => sum + Number(item.price), 0);
      paidAmount = isPaid ? totalAmount : 0;
    }

    if (subcategory === "pinturas") {
      if (paints.length === 0) {
        return {
          error: "Agregá al menos una pintura con color, cantidad y peso.",
        };
      }
      description = paints.map((item) => item.color.trim()).join(", ");
    }

    if (subcategory === "accesorios") {
      if (accessories.length === 0) {
        return {
          error:
            "Agregá al menos un accesorio con nombre, medida, cantidad y precio.",
        };
      }
      description = accessories.map((item) => item.name.trim()).join(", ");
      totalAmount = accessories.reduce(
        (sum, item) => sum + Number(item.totalPrice),
        0,
      );
      paidAmount = isPaid ? totalAmount : 0;
    }
  }

  if (!description) {
    return { error: "Completá fecha, categoría y descripción." };
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

  const input = normalizeVentureFinanceInput({
    date,
    category,
    subcategory,
    description,
    movementType,
    totalAmount,
    paidAmount,
    isPaid,
  });

  try {
    if (category === "Materiales" && !id) {
      const materialType = subcategory as MaterialSubcategory;

      if (materialType === "maderas") {
        const entry = await createVentureFinanceEntry(input, user);
        await createWoodMaterials(woods, {
          financeEntryId: entry.id,
          date,
          createdBy: user,
        });
        return { entry };
      }

      if (materialType === "pinturas") {
        const entry = await createVentureFinanceEntry(input, user);
        await createPaintMaterials(paints, totalAmount, {
          financeEntryId: entry.id,
          date,
          createdBy: user,
        });
        return { entry };
      }

      if (materialType === "accesorios") {
        const entry = await createVentureFinanceEntry(input, user);
        await createAccessoryMaterials(accessories, {
          financeEntryId: entry.id,
          date,
          createdBy: user,
        });
        return { entry };
      }

      return { error: "Subcategoría de material no válida." };
    }

    const entry = id
      ? await updateVentureFinanceEntry(id, input)
      : await createVentureFinanceEntry(input, user);

    return { entry };
  } catch (error) {
    console.error("No se pudo guardar el movimiento de emprendimiento.", error);
    return { error: "No se pudo guardar el movimiento en Firebase." };
  }
}
