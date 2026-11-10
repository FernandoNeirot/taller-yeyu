import { FieldValue, type DocumentData } from "firebase-admin/firestore";
import { COST_MATERIALS_COLLECTION, getAdminFirestore } from "@/lib/firebase-admin";
import {
  computeCostPerUnit,
  isMaterialCategory,
  isMeasureType,
  type Material,
  type WorkArea,
} from "@/types/material";

export type MaterialInput = Omit<Material, "id" | "costPerUnit">;

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function mapWorkArea(value: unknown): WorkArea | undefined {
  if (!value || typeof value !== "object") return undefined;
  const data = value as Record<string, unknown>;
  const widthCm = toNumber(data.widthCm);
  const heightCm = toNumber(data.heightCm);
  return widthCm > 0 && heightCm > 0 ? { widthCm, heightCm } : undefined;
}

function mapMaterialDoc(id: string, data: DocumentData): Material | null {
  const name = String(data.name ?? "").trim();
  if (!name || !isMeasureType(data.measureType)) return null;

  const totalCost = toNumber(data.totalCost);
  const totalUnits = toNumber(data.totalUnits);

  return {
    id,
    name,
    measureType: data.measureType,
    category: isMaterialCategory(data.category) ? data.category : "other",
    workArea: mapWorkArea(data.workArea),
    totalCost,
    totalUnits,
    costPerUnit: computeCostPerUnit(totalCost, totalUnits),
  };
}

/** Catálogo ordenado por nombre. Si Firestore falla devuelve una lista vacía. */
export async function getMaterialCatalog(): Promise<Material[]> {
  try {
    const snapshot = await getAdminFirestore()
      .collection(COST_MATERIALS_COLLECTION)
      .get();

    return snapshot.docs
      .map((doc) => mapMaterialDoc(doc.id, doc.data()))
      .filter((material): material is Material => material !== null)
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  } catch (error) {
    console.error("No se pudieron leer los materiales.", error);
    return [];
  }
}

function toPayload(input: MaterialInput) {
  return {
    name: input.name.trim(),
    measureType: input.measureType,
    category: input.category ?? "other",
    workArea: input.workArea ?? null,
    totalCost: input.totalCost,
    totalUnits: input.totalUnits,
    costPerUnit: computeCostPerUnit(input.totalCost, input.totalUnits),
  };
}

export async function createMaterial(input: MaterialInput): Promise<Material> {
  const payload = toPayload(input);
  const docRef = await getAdminFirestore()
    .collection(COST_MATERIALS_COLLECTION)
    .add({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

  return { id: docRef.id, ...payload, workArea: input.workArea };
}

export async function updateMaterial(
  id: string,
  input: MaterialInput,
): Promise<Material> {
  const payload = toPayload(input);
  const docRef = getAdminFirestore().collection(COST_MATERIALS_COLLECTION).doc(id);

  if (!(await docRef.get()).exists) {
    throw new Error("El material no existe.");
  }

  await docRef.update({ ...payload, updatedAt: FieldValue.serverTimestamp() });
  return { id, ...payload, workArea: input.workArea };
}

export async function deleteMaterial(id: string) {
  await getAdminFirestore().collection(COST_MATERIALS_COLLECTION).doc(id).delete();
  return id;
}
