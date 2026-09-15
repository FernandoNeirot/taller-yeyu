import type { PackageSize } from "@/features/products/lib/logistics";

export type CartItem = {
  id: string;
  slug: string;
  title: string;
  featuredImage: string;
  price?: number;
  quantity: number;
  customNotes: string;
  customizable: boolean;
  weightGrams: number;
  dimensions: PackageSize;
  specificationsDimensions: string;
};

export type ShippingOption = {
  id: "domicilio" | "sucursal";
  label: string;
  price: number;
  estimatedDays?: string;
  description?: string;
};

export type CartTotals = {
  subtotalPrice: number;
  totalWeightGrams: number;
  totalVolumeCm3: number;
  envelope: PackageSize;
  itemCount: number;
};
