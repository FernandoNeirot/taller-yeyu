import type { MaterialSubcategory } from "@/features/finance/types";

export type WoodFaceType = "natural" | "white";

export type ProductCostAccessory = {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  measureType?: "unidad" | "centimetro";
  amount: number;
};

export type ProductCostWood = {
  id: string;
  quantity?: number;
  widthCm?: number;
  lengthCm?: number;
  face?: WoodFaceType;
  amount?: number;
};

export type ProductCostLineUnit = "unidad" | "minuto" | "cm" | "gramo" | "tabla";

export type ProductCostLine = {
  id: string;
  kind: "wood" | "catalog" | "custom";
  catalogType?: MaterialSubcategory;
  materialId?: string;
  description: string;
  quantity: number;
  unit: ProductCostLineUnit;
  unitPrice: number;
  amount: number;
  widthCm?: number;
  lengthCm?: number;
  face?: WoodFaceType;
};

export type ProductCostQuote = {
  lines?: ProductCostLine[];
  woods?: ProductCostWood[];
  woodQuantity?: number;
  woodWidthCm?: number;
  woodLengthCm?: number;
  woodFace?: WoodFaceType;
  woodAmount?: number;
  machineMinutes?: number;
  machineHourlyRate?: number;
  machineAmount?: number;
  laborMinutes?: number;
  laborHourlyRate?: number;
  laborAmount?: number;
  accessories?: ProductCostAccessory[];
  usesPaint?: boolean;
  paintAmount?: number;
  totalAmount?: number;
};

export type ProductQuantityPrice = {
  quantity: number;
  price: number;
};

/** Formato de venta mayorista: `price` es el precio final del pack completo. */
export type ProductPackOption = {
  quantity: number;
  price: number;
};

export type ProductVariant = {
  description: string;
  price: number;
};
