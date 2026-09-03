import { FieldValue } from "firebase-admin/firestore";
import {
  FAMILY_FINANCE_COLLECTION,
  getAdminFirestore,
} from "@/lib/firebase-admin";
import {
  getPaymentStatus,
  type FamilyFinanceEntry,
  type FamilyFinanceInput,
  type MovementType,
} from "../types";

function isMovementType(value: unknown): value is MovementType {
  return value === "ingreso" || value === "egreso";
}

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function normalizeFamilyFinanceInput(input: FamilyFinanceInput) {
  const totalAmount = Number(input.totalAmount);
  const paidAmountRaw = Number(input.paidAmount);
  const paidAmount = input.isPaid
    ? totalAmount
    : Math.min(Math.max(paidAmountRaw, 0), totalAmount);
  const isPaid = input.isPaid || paidAmount >= totalAmount;
  const paymentStatus = getPaymentStatus(totalAmount, paidAmount, isPaid);

  return {
    date: input.date.trim(),
    category: input.category.trim(),
    description: input.description.trim(),
    movementType: input.movementType,
    totalAmount,
    paidAmount,
    remainingAmount: Math.max(totalAmount - paidAmount, 0),
    isPaid,
    paymentStatus,
  };
}

export async function getFamilyFinanceEntries(): Promise<FamilyFinanceEntry[]> {
  let snapshot;

  try {
    snapshot = await getAdminFirestore()
      .collection(FAMILY_FINANCE_COLLECTION)
      .orderBy("date", "desc")
      .get();
  } catch (error) {
    console.error(
      "No se pudieron leer los movimientos familiares de Firestore.",
      error,
    );
    return [];
  }

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const totalAmount = toNumber(data.totalAmount);
    const paidAmount = toNumber(data.paidAmount);
    const isPaid = Boolean(data.isPaid) || paidAmount >= totalAmount;

    return {
      id: doc.id,
      date: String(data.date ?? ""),
      category: String(data.category ?? ""),
      description: String(data.description ?? ""),
      movementType: isMovementType(data.movementType)
        ? data.movementType
        : "egreso",
      totalAmount,
      paidAmount,
      remainingAmount: toNumber(data.remainingAmount) || Math.max(totalAmount - paidAmount, 0),
      isPaid,
      paymentStatus: getPaymentStatus(totalAmount, paidAmount, isPaid),
      createdBy: String(data.createdBy ?? ""),
    };
  });
}

export async function createFamilyFinanceEntry(
  input: FamilyFinanceInput,
  createdBy: string,
) {
  const payload = normalizeFamilyFinanceInput(input);
  const docRef = await getAdminFirestore()
    .collection(FAMILY_FINANCE_COLLECTION)
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
  } satisfies FamilyFinanceEntry;
}

export async function updateFamilyFinanceEntry(
  id: string,
  input: FamilyFinanceInput,
) {
  const payload = normalizeFamilyFinanceInput(input);
  const docRef = getAdminFirestore()
    .collection(FAMILY_FINANCE_COLLECTION)
    .doc(id);
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
  } satisfies FamilyFinanceEntry;
}

