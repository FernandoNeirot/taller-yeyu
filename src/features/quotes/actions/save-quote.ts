"use server";

import { requireAdmin } from "@/features/admin/services/auth";
import { getMaterials } from "@/features/finance/services/venture-finance";
import {
  buildMaterialCatalog,
  computeQuoteItemAmount,
  isQuoteItemType,
  quoteQuantity,
  woodAreaCm2,
  type Quote,
  type QuoteItem,
  type QuoteItemType,
} from "../types";
import { createQuote, normalizeQuoteInput, updateQuote } from "../services/quotes";

export type SaveQuoteState = {
  error?: string;
  quote?: Quote;
};

type SubmittedItem = {
  id?: string;
  type?: QuoteItemType;
  materialId?: string;
  materialName?: string;
  widthCm?: number;
  lengthCm?: number;
  quantity?: number;
  grams?: number;
};

function parseItems(raw: FormDataEntryValue | null): SubmittedItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw));
    return Array.isArray(parsed) ? (parsed as SubmittedItem[]) : [];
  } catch {
    return [];
  }
}

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

  const materials = await getMaterials();
  const catalog = buildMaterialCatalog(materials);
  const submitted = parseItems(formData.get("items"));

  const items: QuoteItem[] = [];

  for (const item of submitted) {
    const materialId = String(item.materialId ?? "").trim();
    if (!materialId) continue;

    const material =
      catalog.find((option) => option.id === materialId) ??
      catalog.find(
        (option) =>
          option.name.toLowerCase() ===
          String(item.materialName ?? "").trim().toLowerCase(),
      );

    const type = material?.type ?? (isQuoteItemType(item.type) ? item.type : null);
    const materialName = material?.name ?? String(item.materialName ?? "").trim();
    if (!type || !materialName) continue;

    const quantity = quoteQuantity(Number(item.quantity));
    const widthCm = Number(item.widthCm) || 0;
    const lengthCm = Number(item.lengthCm) || 0;
    const grams = Number(item.grams) || 0;

    if (type === "maderas" && (!(widthCm > 0) || !(lengthCm > 0))) continue;
    if (type === "pinturas" && !(grams > 0)) continue;
    if (type === "accesorios" && !(quantity > 0)) continue;

    const next: QuoteItem = {
      id: item.id || crypto.randomUUID(),
      type,
      materialId: material?.id ?? materialId,
      materialName,
      widthCm: type === "maderas" ? widthCm : undefined,
      lengthCm: type === "maderas" ? lengthCm : undefined,
      quantity,
      grams: type === "pinturas" ? grams : undefined,
      areaCm2:
        type === "maderas" ? woodAreaCm2(widthCm, lengthCm) : undefined,
      pricePerCm2: material?.pricePerCm2,
      pricePerGram: material?.pricePerGram,
      unitPrice: material?.unitPrice,
      measureType: material?.measureType,
      amount: 0,
    };
    next.amount = computeQuoteItemAmount(next);
    items.push(next);
  }

  if (items.length === 0) {
    return {
      error: "Agregá al menos un material con sus medidas o cantidad.",
    };
  }

  const input = normalizeQuoteInput({ name, date, items });

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
