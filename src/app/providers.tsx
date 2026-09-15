"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartToast } from "@/components/cart/add-to-cart-button";
import { CartProvider } from "@/context/CartContext";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        {children}
        <CartDrawer />
        <CartToast />
      </CartProvider>
    </QueryClientProvider>
  );
}
