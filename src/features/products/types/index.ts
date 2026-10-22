import type {
  ProductCostQuote,
  ProductPackOption,
  ProductQuantityPrice,
  ProductVariant,
} from "@/types/product-pricing";
import type { PowerSource } from "@/types/product";

export type { Product } from "@/types/product";

export type ProductInput = {
  title: string;
  shortDescription: string;
  fullDescription: string;
  categories: string[];
  topics: string[];
  dimensions: string;
  heightCm: number | null;
  widthCm: number | null;
  depthCm: number | null;
  diameterCm: number | null;
  finish: string;
  thickness: string;
  hasLighting: boolean;
  powerSource: PowerSource;
  customizable: boolean;
  price: number | null;
  packOptions?: ProductPackOption[];
  quantityPrices?: ProductQuantityPrice[];
  variants?: ProductVariant[];
  isActive: boolean;
  costQuote?: ProductCostQuote;
};
