export type { Product } from "@/types/product";

export type ProductInput = {
  title: string;
  shortDescription: string;
  fullDescription: string;
  categories: string[];
  topics: string[];
  dimensions: string;
  finish: string;
  customizable: boolean;
  price: number | null;
  isActive: boolean;
};
