"use server";

import { requireAdmin } from "@/features/admin/services/auth";
import {
  finalizeQuoteItems,
  parseQuoteItemInputs,
} from "@/features/materials/lib/quote-items";
import { getMaterialCatalog } from "@/features/materials/services/materials";
import type { Quote } from "../types";
import { createQuote, updateQuote } from "../services/quotes";

export type SaveQuoteState = {
  error?: string;
  quote?: Quote;
};

export async function saveQuoteAction(
  _prev: SaveQuoteState | null,
  formData: FormData,
): Promise<SaveQuoteState> {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const date =
    String(formData.get("date") ?? "").trim() ||
    new Date().toLocaleDateString("en-CA");

  if (!name) {
    return { error: "Poné un nombre a la cotización." };
  }

  // Nombres, cantidades y costos se recalculan con el catálogo vigente.
  const materials = await getMaterialCatalog();
  const items = finalizeQuoteItems(
    parseQuoteItemInputs(formData.get("items")),
    materials,
  );

  if (items.length === 0) {
    return {
      error: "Agregá al menos un material con sus medidas o cantidad.",
    };
  }

  const input = { name, date, items };

  try {
    const quote = id
      ? await updateQuote(id, input)
      : await createQuote(input, user);
    return { quote };
  } catch (error) {
    console.error("No se pudo guardar la cotización.", error);
    return { error: "No se pudo guardar la cotización en Firebase." };
  }
}
