import { FieldValue, type DocumentData } from "firebase-admin/firestore";
import {
  MATERIALS_COLLECTION,
  VENTURE_FINANCE_COLLECTION,
  getAdminFirestore,
} from "@/lib/firebase-admin";
import {
  getPaymentStatus,
  type AccessoryMaterialInput,
  type MaterialRecord,
  type MaterialSubcategory,
  type PaintMaterialInput,
  type VentureFinanceEntry,
  type VentureFinanceInput,
  type WoodMaterialInput,
  type MovementType,
  type AccessoryMeasureType,
} from "../types";

function isMovementType(value: unknown): value is MovementType {
  return value === "ingreso" || value === "egreso";
}

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function normalizeVentureFinanceInput(input: VentureFinanceInput) {
  const totalAmount = Number(input.totalAmount);
  const paidAmountRaw = Number(input.paidAmount);
  const paidAmount = input.isPaid
    ? totalAmount
    : Math.min(Math.max(paidAmountRaw, 0), totalAmount);
  const isPaid = input.isPaid || paidAmount >= totalAmount;

  return {
    date: input.date.trim(),
    category: input.category.trim(),
    subcategory: (input.subcategory ?? "").trim(),
    description: input.description.trim(),
    movementType: input.movementType,
    totalAmount,
    paidAmount,
    remainingAmount: Math.max(totalAmount - paidAmount, 0),
    isPaid,
    paymentStatus: getPaymentStatus(totalAmount, paidAmount, isPaid),
  };
}

function mapVentureDoc(id: string, data: DocumentData): VentureFinanceEntry {
  const totalAmount = toNumber(data.totalAmount);
  const paidAmount = toNumber(data.paidAmount);
  const isPaid = Boolean(data.isPaid) || paidAmount >= totalAmount;

  return {
    id,
    date: String(data.date ?? ""),
    category: String(data.category ?? ""),
    subcategory: String(data.subcategory ?? ""),
    description: String(data.description ?? ""),
    movementType: isMovementType(data.movementType)
      ? data.movementType
      : "egreso",
    totalAmount,
    paidAmount,
    remainingAmount:
      toNumber(data.remainingAmount) || Math.max(totalAmount - paidAmount, 0),
    isPaid,
    paymentStatus: getPaymentStatus(totalAmount, paidAmount, isPaid),
    createdBy: String(data.createdBy ?? ""),
  };
}

export async function getVentureFinanceEntries(): Promise<VentureFinanceEntry[]> {
  let snapshot;

  try {
    snapshot = await getAdminFirestore()
      .collection(VENTURE_FINANCE_COLLECTION)
      .orderBy("date", "desc")
      .get();
  } catch (error) {
    console.error(
      "No se pudieron leer los movimientos de emprendimiento.",
      error,
    );
    return [];
  }

  return snapshot.docs.map((doc) => mapVentureDoc(doc.id, doc.data()));
}

export async function createVentureFinanceEntry(
  input: VentureFinanceInput,
  createdBy: string,
) {
  const payload = normalizeVentureFinanceInput(input);
  const docRef = await getAdminFirestore()
    .collection(VENTURE_FINANCE_COLLECTION)
    .add({
      ...payload,
      createdBy,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

  return {
    id: docRef.id,
    ...payload,
    createdBy,
  } satisfies VentureFinanceEntry;
}

export async function updateVentureFinanceEntry(
  id: string,
  input: VentureFinanceInput,
) {
  const payload = normalizeVentureFinanceInput(input);
  const docRef = getAdminFirestore().collection(VENTURE_FINANCE_COLLECTION).doc(id);
  const existing = await docRef.get();

  if (!existing.exists) {
    throw new Error("El movimiento no existe.");
  }

  await docRef.update({
    ...payload,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    id,
    ...payload,
    createdBy: String(existing.data()?.createdBy ?? ""),
  } satisfies VentureFinanceEntry;
}

export async function createWoodMaterials(
  items: WoodMaterialInput[],
  meta: { financeEntryId: string; date: string; createdBy: string },
) {
  const batch = getAdminFirestore().batch();
  const created: MaterialRecord[] = [];

  for (const item of items) {
    const widthCm = Number(item.widthCm);
    const lengthCm = Number(item.lengthCm);
    const price = Number(item.price);
    const areaCm2 = widthCm * lengthCm;
    const pricePerCm2 = areaCm2 > 0 ? price / areaCm2 : 0;
    const docRef = getAdminFirestore().collection(MATERIALS_COLLECTION).doc();
    const payload = {
      type: "maderas" as MaterialSubcategory,
      name: item.name.trim(),
      financeEntryId: meta.financeEntryId,
      date: meta.date,
      widthCm,
      lengthCm,
      areaCm2,
      price,
      pricePerCm2,
      createdBy: meta.createdBy,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    batch.set(docRef, payload);
    created.push({
      id: docRef.id,
      type: "maderas",
      name: payload.name,
      financeEntryId: meta.financeEntryId,
      date: meta.date,
      widthCm,
      lengthCm,
      areaCm2,
      price,
      pricePerCm2,
      createdBy: meta.createdBy,
    });
  }

  await batch.commit();
  return created;
}

export async function createPaintMaterials(
  items: PaintMaterialInput[],
  totalPurchasePrice: number,
  meta: { financeEntryId: string; date: string; createdBy: string },
) {
  const batch = getAdminFirestore().batch();
  const created: MaterialRecord[] = [];
  const totalUnits = items.reduce((acc, item) => acc + Number(item.quantity), 0);
  const totalGramsAll = items.reduce(
    (acc, item) => acc + Number(item.quantity) * Number(item.weightGrams),
    0,
  );

  for (const item of items) {
    const quantity = Number(item.quantity);
    const weightGrams = Number(item.weightGrams);
    const totalGrams = quantity * weightGrams;
    const unitPrice =
      totalUnits > 0 ? (totalPurchasePrice * quantity) / totalUnits : 0;
    const pricePerGram =
      totalGramsAll > 0 ? totalPurchasePrice / totalGramsAll : 0;
    const docRef = getAdminFirestore().collection(MATERIALS_COLLECTION).doc();
    const name = `Pintura ${item.color.trim()} ${weightGrams}g`;
    const payload = {
      type: "pinturas" as MaterialSubcategory,
      name,
      financeEntryId: meta.financeEntryId,
      date: meta.date,
      color: item.color.trim(),
      quantity,
      weightGrams,
      totalGrams,
      unitPrice,
      pricePerGram,
      totalPrice: unitPrice,
      createdBy: meta.createdBy,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    batch.set(docRef, payload);
    created.push({
      id: docRef.id,
      type: "pinturas",
      name,
      financeEntryId: meta.financeEntryId,
      date: meta.date,
      color: payload.color,
      quantity,
      weightGrams,
      totalGrams,
      unitPrice,
      pricePerGram,
      totalPrice: unitPrice,
      createdBy: meta.createdBy,
    });
  }

  await batch.commit();
  return created;
}

export async function createAccessoryMaterials(
  items: AccessoryMaterialInput[],
  meta: { financeEntryId: string; date: string; createdBy: string },
) {
  const batch = getAdminFirestore().batch();
  const created: MaterialRecord[] = [];

  for (const item of items) {
    const quantity = Number(item.quantity);
    const totalPrice = Number(item.totalPrice);
    const unitPrice = quantity > 0 ? totalPrice / quantity : 0;
    const measureType = item.measureType as AccessoryMeasureType;
    const docRef = getAdminFirestore().collection(MATERIALS_COLLECTION).doc();
    const payload = {
      type: "accesorios" as MaterialSubcategory,
      name: item.name.trim(),
      financeEntryId: meta.financeEntryId,
      date: meta.date,
      measureType,
      quantity,
      totalPrice,
      unitPrice,
      createdBy: meta.createdBy,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    batch.set(docRef, payload);
    created.push({
      id: docRef.id,
      type: "accesorios",
      name: payload.name,
      financeEntryId: meta.financeEntryId,
      date: meta.date,
      measureType,
      quantity,
      totalPrice,
      unitPrice,
      createdBy: meta.createdBy,
    });
  }

  await batch.commit();
  return created;
}

function isMaterialSubcategory(value: unknown): value is MaterialSubcategory {
  return (
    value === "maderas" || value === "pinturas" || value === "accesorios"
  );
}

function mapMaterialDoc(id: string, data: DocumentData): MaterialRecord {
  return {
    id,
    type: isMaterialSubcategory(data.type) ? data.type : "maderas",
    name: String(data.name ?? ""),
    financeEntryId: String(data.financeEntryId ?? ""),
    date: String(data.date ?? ""),
    widthCm: toNumber(data.widthCm) || undefined,
    lengthCm: toNumber(data.lengthCm) || undefined,
    areaCm2: toNumber(data.areaCm2) || undefined,
    price: toNumber(data.price) || undefined,
    pricePerCm2: toNumber(data.pricePerCm2) || undefined,
    color: data.color ? String(data.color) : undefined,
    quantity: toNumber(data.quantity) || undefined,
    weightGrams: toNumber(data.weightGrams) || undefined,
    totalGrams: toNumber(data.totalGrams) || undefined,
    unitPrice: toNumber(data.unitPrice) || undefined,
    pricePerGram: toNumber(data.pricePerGram) || undefined,
    measureType:
      data.measureType === "unidad" || data.measureType === "centimetro"
        ? data.measureType
        : undefined,
    totalPrice: toNumber(data.totalPrice) || undefined,
    createdBy: String(data.createdBy ?? ""),
  };
}

export async function getMaterials(): Promise<MaterialRecord[]> {
  let snapshot;

  try {
    snapshot = await getAdminFirestore()
      .collection(MATERIALS_COLLECTION)
      .orderBy("date", "desc")
      .get();
  } catch (error) {
    console.error("No se pudieron leer los materiales.", error);
    return [];
  }

  return snapshot.docs.map((doc) => mapMaterialDoc(doc.id, doc.data()));
}
