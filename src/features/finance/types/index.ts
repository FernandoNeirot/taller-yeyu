export const movementTypes = ["ingreso", "egreso"] as const;
export type MovementType = (typeof movementTypes)[number];

export const familyCategories = [
  "Auto",
  "Casa",
  "Cecilia",
  "Elizabeth",
  "Extras",
  "Farmacia",
  "Fernando",
  "Ferreteria",
  "Limpieza",
  "Mascotas",
  "Servicios",
  "Sueldo",
] as const;

export type FamilyCategory = (typeof familyCategories)[number];

export const ventureCategories = [
  "Envíos",
  "Herramientas",
  "Impuestos",
  "Marketing",
  "Materiales",
  "Otros",
  "Servicios",
  "Ventas",
] as const;

export type VentureCategory = (typeof ventureCategories)[number];

export const materialSubcategories = [
  "maderas",
  "pinturas",
  "accesorios",
] as const;

export type MaterialSubcategory = (typeof materialSubcategories)[number];

export const materialSubcategoryLabels: Record<MaterialSubcategory, string> = {
  maderas: "Maderas",
  pinturas: "Pinturas",
  accesorios: "Accesorios",
};

export const accessoryMeasureTypes = ["unidad", "centimetro"] as const;
export type AccessoryMeasureType = (typeof accessoryMeasureTypes)[number];

export const paymentStatuses = ["pagado", "parcial", "pendiente"] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export type FamilyFinanceEntry = {
  id: string;
  date: string;
  category: string;
  description: string;
  movementType: MovementType;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  isPaid: boolean;
  paymentStatus: PaymentStatus;
  createdBy: string;
};

export type FamilyFinanceInput = {
  date: string;
  category: string;
  description: string;
  movementType: MovementType;
  totalAmount: number;
  paidAmount: number;
  isPaid: boolean;
};

export type VentureFinanceEntry = {
  id: string;
  date: string;
  category: string;
  subcategory: string;
  description: string;
  movementType: MovementType;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  isPaid: boolean;
  paymentStatus: PaymentStatus;
  createdBy: string;
};

export type VentureFinanceInput = {
  date: string;
  category: string;
  subcategory?: string;
  description: string;
  movementType: MovementType;
  totalAmount: number;
  paidAmount: number;
  isPaid: boolean;
};

export type WoodMaterialInput = {
  name: string;
  widthCm: number;
  lengthCm: number;
  price: number;
};

export type PaintMaterialInput = {
  color: string;
  quantity: number;
  weightGrams: number;
};

export type AccessoryMaterialInput = {
  name: string;
  measureType: AccessoryMeasureType;
  quantity: number;
  totalPrice: number;
};

export type MaterialRecord = {
  id: string;
  type: MaterialSubcategory;
  name: string;
  financeEntryId: string;
  date: string;
  widthCm?: number;
  lengthCm?: number;
  areaCm2?: number;
  price?: number;
  pricePerCm2?: number;
  color?: string;
  quantity?: number;
  weightGrams?: number;
  totalGrams?: number;
  unitPrice?: number;
  pricePerGram?: number;
  measureType?: AccessoryMeasureType;
  totalPrice?: number;
  createdBy: string;
};

export function getPaymentStatus(
  totalAmount: number,
  paidAmount: number,
  isPaid: boolean,
): PaymentStatus {
  if (isPaid || paidAmount >= totalAmount) {
    return "pagado";
  }

  if (paidAmount > 0) {
    return "parcial";
  }

  return "pendiente";
}
