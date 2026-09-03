import { FieldValue, type DocumentData } from "firebase-admin/firestore";
import { QUOTES_COLLECTION, getAdminFirestore } from "@/lib/firebase-admin";
import {
  computeQuoteItemAmount,
  isQuoteItemType,
  quoteQuantity,
  woodAreaCm2,
  type Quote,
  type QuoteInput,
  type QuoteItem,
  type QuoteItemType,
} from "../types";

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function inferType(data: Record<string, unknown>): QuoteItemType {
  if (isQuoteItemType(data.type)) return data.type;
  if (toNumber(data.pricePerGram) > 0 || toNumber(data.grams) > 0) {
    return "pinturas";
  }
  if (data.measureType === "unidad" || data.measureType === "centimetro") {
    return "accesorios";
  }
  return "maderas";
}

function mapQuoteItem(value: unknown): QuoteItem | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  const materialName = String(data.materialName ?? "").trim();
  const materialId = String(data.materialId ?? "").trim();
  if (!materialId || !materialName) return null;

  const type = inferType(data);
  const quantity = quoteQuantity(toNumber(data.quantity) || 1);
  const widthCm = toNumber(data.widthCm) || undefined;
  const lengthCm = toNumber(data.lengthCm) || undefined;
  const grams = toNumber(data.grams) || undefined;
  const pricePerCm2 = toNumber(data.pricePerCm2) || undefined;
  const pricePerGram = toNumber(data.pricePerGram) || undefined;
  const unitPrice = toNumber(data.unitPrice) || undefined;
  const measureType =
    data.measureType === "unidad" || data.measureType === "centimetro"
      ? data.measureType
      : undefined;

  if (type === "maderas" && (!(widthCm ?? 0) || !(lengthCm ?? 0))) return null;
  if (type === "pinturas" && !(grams ?? 0)) return null;
  if (type === "accesorios" && !quantity) return null;

  const item = {
    id: String(data.id ?? crypto.randomUUID()),
    type,
    materialId,
    materialName,
    widthCm,
    lengthCm,
    quantity,
    grams,
    areaCm2:
      type === "maderas"
        ? toNumber(data.areaCm2) ||
          woodAreaCm2(widthCm ?? 0, lengthCm ?? 0)
        : undefined,
    pricePerCm2,
    pricePerGram,
    unitPrice,
    measureType,
    amount: 0,
  } satisfies QuoteItem;

  return {
    ...item,
    amount: toNumber(data.amount) || computeQuoteItemAmount(item),
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
    totalAmount:
      toNumber(data.totalAmount) ||
      items.reduce((acc, item) => acc + item.amount, 0),
    createdBy: String(data.createdBy ?? ""),
  };
}

function omitUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}

function toFirestoreItem(item: QuoteItem) {
  return omitUndefined({
    id: item.id,
    type: item.type,
    materialId: item.materialId,
    materialName: item.materialName,
    widthCm: item.widthCm,
    lengthCm: item.lengthCm,
    quantity: item.quantity,
    grams: item.grams,
    areaCm2: item.areaCm2,
    pricePerCm2: item.pricePerCm2,
    pricePerGram: item.pricePerGram,
    unitPrice: item.unitPrice,
    measureType: item.measureType,
    amount: item.amount,
  });
}

export function normalizeQuoteInput(input: QuoteInput) {
  const name = input.name.trim();
  const items = input.items.map((item) => {
    const type = isQuoteItemType(item.type) ? item.type : "maderas";
    const quantity = quoteQuantity(Number(item.quantity));
    const widthCm = type === "maderas" ? Number(item.widthCm) || 0 : undefined;
    const lengthCm = type === "maderas" ? Number(item.lengthCm) || 0 : undefined;
    const grams = type === "pinturas" ? Number(item.grams) || 0 : undefined;
    const next = {
      id: item.id || crypto.randomUUID(),
      type,
      materialId: item.materialId,
      materialName: item.materialName.trim(),
      widthCm,
      lengthCm,
      quantity,
      grams,
      areaCm2:
        type === "maderas"
          ? woodAreaCm2(widthCm ?? 0, lengthCm ?? 0)
          : undefined,
      pricePerCm2: type === "maderas" ? Number(item.pricePerCm2) || 0 : undefined,
      pricePerGram:
        type === "pinturas" ? Number(item.pricePerGram) || 0 : undefined,
      unitPrice: type === "accesorios" ? Number(item.unitPrice) || 0 : undefined,
      measureType: type === "accesorios" ? item.measureType : undefined,
      amount: 0,
    } satisfies QuoteItem;

    return {
      ...next,
      amount: computeQuoteItemAmount(next),
    };
  });

  return {
    name,
    date: input.date.trim(),
    items,
    totalAmount: items.reduce((acc, item) => acc + item.amount, 0),
  };
}

function firestoreQuotePayload(
  payload: ReturnType<typeof normalizeQuoteInput>,
  extra: Record<string, unknown> = {},
) {
  return {
    name: payload.name,
    date: payload.date,
    items: payload.items.map(toFirestoreItem),
    totalAmount: payload.totalAmount,
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
  const payload = normalizeQuoteInput(input);
  const docRef = await getAdminFirestore()
    .collection(QUOTES_COLLECTION)
    .add(
      firestoreQuotePayload(payload, {
        createdBy,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }),
    );

  return {
    id: docRef.id,
    ...payload,
    createdBy,
  } satisfies Quote;
}

export async function updateQuote(id: string, input: QuoteInput) {
  const payload = normalizeQuoteInput(input);
  const docRef = getAdminFirestore().collection(QUOTES_COLLECTION).doc(id);
  const existing = await docRef.get();

  if (!existing.exists) {
    throw new Error("La cotización no existe.");
  }

  await docRef.update(
    firestoreQuotePayload(payload, {
      updatedAt: FieldValue.serverTimestamp(),
    }),
  );

  return {
    id,
    ...payload,
    createdBy: String(existing.data()?.createdBy ?? ""),
  } satisfies Quote;
}
