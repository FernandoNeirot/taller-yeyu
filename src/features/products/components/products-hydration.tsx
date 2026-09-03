"use client";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { type ReactNode, useMemo } from "react";
import type { Product } from "../types";
import { PRODUCTS_QUERY_KEY } from "../hooks/use-products";

type Props = {
  products: Product[];
  children: ReactNode;
};

export function ProductsHydration({ products, children }: Props) {
  const dehydratedState = useMemo(() => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(PRODUCTS_QUERY_KEY, products);
    return dehydrate(queryClient);
  }, [products]);

  return (
    <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
  );
}
