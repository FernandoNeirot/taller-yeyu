import type { ProductCostQuote } from "../lib/cost-quote";
import type { ProductQuantityPrice } from "../lib/quantity-prices";
import type { ProductVariant } from "../lib/variants";

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
  customizable: boolean;
  price: number | null;
  quantityPrices?: ProductQuantityPrice[];
  variants?: ProductVariant[];
  isActive: boolean;
  costQuote?: ProductCostQuote;
};
