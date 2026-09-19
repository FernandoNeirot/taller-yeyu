import { computeCartTotals } from "@/features/cart/totals";
import type { CartItem, ShippingOption } from "@/features/cart/types";
import { quoteAndreaniShipping } from "@/lib/andreani";
import {
  exceedsStandardMail,
  getProductLogistics,
} from "@/features/products/lib/logistics";
import { formatProductDimensions } from "@/features/products/lib/measures";
import { getProducts } from "@/features/products/services/get-products";
import type {
  CheckoutItemInput,
  CheckoutRequest,
  ResolvedCheckout,
} from "./types";

export function normalizePostalCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 8);
}

export function isValidArgentinePostalCode(value: string) {
  return /^\d{4}$/.test(normalizePostalCode(value));
}

export async function resolveCheckoutItems(
  rawItems: CheckoutItemInput[],
): Promise<CartItem[]> {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error("El carrito está vacío.");
  }

  const products = await getProducts();
  const byKey = new Map(
    products.flatMap((product) => {
      const keys = [product.id, product.slug].filter(Boolean) as string[];
      return keys.map((key) => [key, product] as const);
    }),
  );

  const items: CartItem[] = [];

  for (const raw of rawItems) {
    const id = String(raw.id ?? "").trim();
    const quantity = Math.floor(Number(raw.quantity));
    if (!id || !Number.isFinite(quantity) || quantity < 1) {
      throw new Error("Hay un ítem del carrito inválido.");
    }

    const product = byKey.get(id);
    if (!product || !product.isActive) {
      throw new Error("Un producto del carrito ya no está disponible.");
    }

    const logistics = getProductLogistics(product);
    const notes = String(raw.customNotes ?? "").trim();

    items.push({
      id: product.id ?? product.slug,
      slug: product.slug,
      title: product.title,
      featuredImage: product.featuredImage,
      price: product.price,
      quantity,
      customNotes: notes,
      customizable: product.specifications.customizable,
      weightGrams: logistics.weightGrams,
      dimensions: logistics.dimensions,
      specificationsDimensions: formatProductDimensions(product),
    });
  }

  return items;
}

export async function quoteShippingForItems(
  items: CartItem[],
  postalCode: string,
): Promise<ShippingOption[]> {
  const totals = computeCartTotals(items);
  return quoteAndreaniShipping({
    postalCode: normalizePostalCode(postalCode),
    totalWeightGrams: totals.totalWeightGrams,
    totalVolumeCm3: totals.totalVolumeCm3,
    envelope: totals.envelope,
    declaredValue: Math.max(totals.subtotalPrice, 1),
  });
}

export async function resolveCheckout(
  input: CheckoutRequest,
): Promise<ResolvedCheckout> {
  const items = await resolveCheckoutItems(input.items);
  const totals = computeCartTotals(items);
  const postalCode = normalizePostalCode(input.postalCode ?? "");
  let shipping: ShippingOption | null = null;

  if (input.shippingOptionId) {
    if (!isValidArgentinePostalCode(postalCode)) {
      throw new Error("Ingresá un código postal válido de 4 dígitos.");
    }
    const options = await quoteShippingForItems(items, postalCode);
    shipping =
      options.find((option) => option.id === input.shippingOptionId) ?? null;
    if (!shipping) {
      throw new Error("La opción de envío elegida ya no está disponible.");
    }
  }

  return {
    items,
    ...totals,
    shipping,
    totalPrice: totals.subtotalPrice + (shipping?.price ?? 0),
    hasUnpricedItems: items.some((item) => item.price == null),
    hasCustomizableItems: items.some((item) => item.customizable),
    exceedsStandardMail: items.some((item) =>
      exceedsStandardMail(item.dimensions, item.weightGrams * item.quantity),
    ),
  };
}
