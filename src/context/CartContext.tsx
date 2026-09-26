"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cartItemKey, computeCartTotals } from "@/features/cart/totals";
import type { CartItem } from "@/features/cart/types";
import { getProductLogistics } from "@/features/products/lib/logistics";
import { formatProductDimensions } from "@/features/products/lib/measures";
import {
  adjacentQuantity,
  normalizeQuantityPrices,
  priceForQuantity,
  purchaseOptions,
} from "@/features/products/lib/quantity-prices";
import type { ProductVariant } from "@/features/products/lib/variants";
import type { Product } from "@/types/product";

const STORAGE_KEY = "talleryeyu-cart-v1";

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  toast: string;
  openCart: () => void;
  closeCart: () => void;
  showToast: (message: string) => void;
  addToCart: (
    product: Product,
    quantity?: number,
    customNotes?: string,
    options?: { openCart?: boolean; variant?: ProductVariant },
  ) => void;
  removeFromCart: (
    id: string,
    customNotes?: string,
    variantDescription?: string,
  ) => void;
  updateQuantity: (
    id: string,
    qty: number,
    customNotes?: string,
    variantDescription?: string,
  ) => void;
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
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number>(0);

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
    (
      product: Product,
      quantity = 1,
      customNotes = "",
      options?: { openCart?: boolean; variant?: ProductVariant },
    ) => {
      const id = productId(product);
      const notes = customNotes.trim();
      const variantDescription = options?.variant?.description.trim() ?? "";
      const key = cartItemKey(id, notes, variantDescription);
      const logistics = getProductLogistics(product);
      const offers = normalizeQuantityPrices(product.quantityPrices) ?? [];
      const requested = Math.max(1, Math.floor(quantity));
      const selectedOffer = priceForQuantity(offers, requested);
      const qty = selectedOffer?.quantity ?? requested;
      const unitPrice = options?.variant?.price ?? product.price;

      setItems((current) => {
        const index = current.findIndex(
          (item) =>
            cartItemKey(item.id, item.customNotes, item.variantDescription) ===
            key,
        );
        if (index >= 0) {
          const next = [...current];
          const previous = next[index];
          next[index] = {
            ...previous,
            price: unitPrice,
            quantityPrices: offers.length > 0 ? offers : undefined,
            variantDescription: variantDescription || undefined,
            quantity: offers.length > 0 ? qty : previous.quantity + qty,
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
            price: unitPrice,
            quantityPrices: offers.length > 0 ? offers : undefined,
            variantDescription: variantDescription || undefined,
            quantity: qty,
            customNotes: notes,
            customizable: product.specifications.customizable,
            weightGrams: logistics.weightGrams,
            dimensions: logistics.dimensions,
            specificationsDimensions: formatProductDimensions(product),
          },
        ];
      });

      if (options?.openCart) setIsOpen(true);
    },
    [],
  );

  const removeFromCart = useCallback(
    (id: string, customNotes = "", variantDescription = "") => {
      const key = cartItemKey(id, customNotes, variantDescription);
      setItems((current) =>
        current.filter(
          (item) =>
            cartItemKey(item.id, item.customNotes, item.variantDescription) !==
            key,
        ),
      );
    },
    [],
  );

  const updateQuantity = useCallback(
    (
      id: string,
      qty: number,
      customNotes = "",
      variantDescription = "",
    ) => {
      const key = cartItemKey(id, customNotes, variantDescription);
      const nextQty = Math.floor(qty);
      setItems((current) => {
        const item = current.find(
          (entry) =>
            cartItemKey(entry.id, entry.customNotes, entry.variantDescription) ===
            key,
        );
        if (!item) return current;

        let resolved = nextQty;
        const steps = purchaseOptions({
          price: item.price,
          quantityPrices: item.quantityPrices,
        });
        if (item.quantityPrices?.length && steps.length > 0) {
          const exact = priceForQuantity(steps, nextQty);
          if (exact) {
            resolved = exact.quantity;
          } else if (nextQty < 1) {
            resolved = 0;
          } else {
            const stepped = adjacentQuantity(
              steps,
              item.quantity,
              nextQty > item.quantity ? 1 : -1,
            );
            resolved = stepped ?? (nextQty < item.quantity ? 0 : item.quantity);
          }
        }

        if (resolved < 1) {
          return current.filter(
            (entry) =>
              cartItemKey(
                entry.id,
                entry.customNotes,
                entry.variantDescription,
              ) !== key,
          );
        }
        return current.map((entry) =>
          cartItemKey(entry.id, entry.customNotes, entry.variantDescription) ===
          key
            ? { ...entry, quantity: resolved }
            : entry,
        );
      });
    },
    [],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const showToast = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(""), 2200);
  }, []);

  const totals = useMemo(() => computeCartTotals(items), [items]);

  const value = useMemo(
    () => ({
      items,
      isOpen,
      toast,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      showToast,
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
      showToast,
      toast,
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
