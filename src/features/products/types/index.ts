import type { ProductCostQuote } from "../lib/cost-quote";

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
  isActive: boolean;
  costQuote?: ProductCostQuote;
};
