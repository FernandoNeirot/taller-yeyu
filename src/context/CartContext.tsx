"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cartItemKey, computeCartTotals } from "@/features/cart/totals";
import type { CartItem } from "@/features/cart/types";
import { getProductLogistics } from "@/features/products/lib/logistics";
import type { Product } from "@/types/product";

const STORAGE_KEY = "talleryeyu-cart-v1";

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number, customNotes?: string) => void;
  removeFromCart: (id: string, customNotes?: string) => void;
  updateQuantity: (id: string, qty: number, customNotes?: string) => void;
  clearCart: () => void;
  subtotalPrice: number;
  totalWeightGrams: number;
  totalVolumeCm3: number;
  envelope: { heightCm: number; widthCm: number; lengthCm: number };
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function productId(product: Product) {
  return product.id ?? product.slug;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      setItems([]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const addToCart = useCallback(
    (product: Product, quantity = 1, customNotes = "") => {
      const id = productId(product);
      const notes = customNotes.trim();
      const key = cartItemKey(id, notes);
      const logistics = getProductLogistics(product);
      const qty = Math.max(1, Math.floor(quantity));

      setItems((current) => {
        const index = current.findIndex(
          (item) => cartItemKey(item.id, item.customNotes) === key,
        );
        if (index >= 0) {
          const next = [...current];
          next[index] = {
            ...next[index],
            quantity: next[index].quantity + qty,
          };
          return next;
        }

        return [
          ...current,
          {
            id,
            slug: product.slug,
            title: product.title,
            featuredImage: product.featuredImage,
            price: product.price,
            quantity: qty,
            customNotes: notes,
            customizable: product.specifications.customizable,
            weightGrams: logistics.weightGrams,
            dimensions: logistics.dimensions,
            specificationsDimensions: product.specifications.dimensions,
          },
        ];
      });
      setIsOpen(true);
    },
    [],
  );

  const removeFromCart = useCallback((id: string, customNotes = "") => {
    const key = cartItemKey(id, customNotes);
    setItems((current) =>
      current.filter((item) => cartItemKey(item.id, item.customNotes) !== key),
    );
  }, []);

  const updateQuantity = useCallback(
    (id: string, qty: number, customNotes = "") => {
      const key = cartItemKey(id, customNotes);
      const nextQty = Math.floor(qty);
      setItems((current) => {
        if (nextQty < 1) {
          return current.filter(
            (item) => cartItemKey(item.id, item.customNotes) !== key,
          );
        }
        return current.map((item) =>
          cartItemKey(item.id, item.customNotes) === key
            ? { ...item, quantity: nextQty }
            : item,
        );
      });
    },
    [],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totals = useMemo(() => computeCartTotals(items), [items]);

  const value = useMemo(
    () => ({
      items,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      ...totals,
    }),
    [
      addToCart,
      clearCart,
      isOpen,
      items,
      removeFromCart,
      totals,
      updateQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider.");
  }
  return context;
}
