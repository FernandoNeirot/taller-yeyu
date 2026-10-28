import { FieldValue, type DocumentData } from "firebase-admin/firestore";
import { splitQuoteTotals } from "@/features/materials/lib/quote-items";
import { isMeasureType, type MeasureType } from "@/types/material";
import { QUOTES_COLLECTION, getAdminFirestore } from "@/lib/firebase-admin";
import type { Quote, QuoteInput, QuoteItem } from "../types";

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/** Las cotizaciones guardadas antes de los materiales de costo usaban `type` y `amount`. */
function legacyMeasureType(data: Record<string, unknown>): MeasureType {
  if (data.type === "maderas") return "area_cm2";
  return "unit";
}

function mapQuoteItem(value: unknown): QuoteItem | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;

  if (isMeasureType(data.measureType) && "quantityUsed" in data) {
    const quantityUsed = toNumber(data.quantityUsed);
    if (!quantityUsed) return null;
    const item: QuoteItem = {
      materialId: String(data.materialId ?? ""),
      name: String(data.name ?? ""),
      measureType: data.measureType,
      quantityUsed,
      calculatedCost: toNumber(data.calculatedCost),
    };
    const widthCm = toNumber(data.widthCm);
    const heightCm = toNumber(data.heightCm);
    if (item.measureType === "area_cm2" && widthCm && heightCm) {
      item.widthCm = widthCm;
      item.heightCm = heightCm;
    }
    return item;
  }

  const name = String(data.materialName ?? "").trim();
  if (!name) return null;
  const measureType = legacyMeasureType(data);
  const quantity = toNumber(data.quantity) || 1;
  const quantityUsed =
    measureType === "area_cm2"
      ? (toNumber(data.areaCm2) || 1) * quantity
      : toNumber(data.grams) || quantity;

  return {
    materialId: String(data.materialId ?? ""),
    name,
    measureType,
    quantityUsed,
    calculatedCost: toNumber(data.amount),
  };
}

function mapQuoteDoc(id: string, data: DocumentData): Quote {
  const items = Array.isArray(data.items)
    ? data.items
        .map((item) => mapQuoteItem(item))
        .filter((item): item is QuoteItem => item !== null)
    : [];

  return {
    id,
    name: String(data.name ?? ""),
    date: String(data.date ?? ""),
    items,
    ...splitQuoteTotals(items),
    createdBy: String(data.createdBy ?? ""),
  };
}

function omitUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}

function firestoreQuotePayload(
  input: QuoteInput,
  extra: Record<string, unknown> = {},
) {
  return {
    name: input.name.trim(),
    date: input.date.trim(),
    items: input.items.map((item) => omitUndefined({ ...item })),
    ...splitQuoteTotals(input.items),
    ...extra,
  };
}

export async function getQuotes(): Promise<Quote[]> {
  let snapshot;

  try {
    snapshot = await getAdminFirestore()
      .collection(QUOTES_COLLECTION)
      .orderBy("date", "desc")
      .get();
  } catch (error) {
    console.error("No se pudieron leer las cotizaciones.", error);
    return [];
  }

  return snapshot.docs.map((doc) => mapQuoteDoc(doc.id, doc.data()));
}

export async function createQuote(input: QuoteInput, createdBy: string) {
  const payload = firestoreQuotePayload(input, {
    createdBy,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  const docRef = await getAdminFirestore()
    .collection(QUOTES_COLLECTION)
    .add(payload);

  return {
    id: docRef.id,
    name: payload.name,
    date: payload.date,
    items: input.items,
    totalMaterialCost: payload.totalMaterialCost,
    totalTimeCost: payload.totalTimeCost,
    totalAmount: payload.totalAmount,
    createdBy,
  } satisfies Quote;
}

export async function updateQuote(id: string, input: QuoteInput) {
  const docRef = getAdminFirestore().collection(QUOTES_COLLECTION).doc(id);
  const existing = await docRef.get();

  if (!existing.exists) {
    throw new Error("La cotización no existe.");
  }

  const payload = firestoreQuotePayload(input, {
    updatedAt: FieldValue.serverTimestamp(),
  });
  await docRef.update(payload);

  return {
    id,
    name: payload.name,
    date: payload.date,
    items: input.items,
    totalMaterialCost: payload.totalMaterialCost,
    totalTimeCost: payload.totalTimeCost,
    totalAmount: payload.totalAmount,
    createdBy: String(existing.data()?.createdBy ?? ""),
  } satisfies Quote;
}
