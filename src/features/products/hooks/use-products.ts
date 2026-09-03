"use client";

import { useQuery } from "@tanstack/react-query";
import type { Product } from "../types";

export const PRODUCTS_QUERY_KEY = ["products"] as const;

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: () => {
      throw new Error(
        "Products should be prefetched on the server via ProductsHydration.",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
}
