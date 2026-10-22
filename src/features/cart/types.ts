import type { PackageSize } from "@/features/products/lib/logistics";
import type { ProductQuantityPrice } from "@/features/products/lib/quantity-prices";
import type { ProductPackOption } from "@/types/product-pricing";

export type CartItem = {
  id: string;
  slug: string;
  title: string;
  featuredImage: string;
  price?: number;
  quantityPrices?: ProductQuantityPrice[];
  variantDescription?: string;
  /**
   * Pack elegido (cantidad y precio final) si el producto se vende por packs.
   * En ese caso `quantity` es la cantidad de unidades del pack y `price` queda vacío.
   */
  selectedPack?: ProductPackOption;
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
