import type { CartItem, ShippingOption } from "@/features/cart/types";

export type CheckoutMethod = "mercadopago" | "whatsapp";

export type CheckoutItemInput = {
  id: string;
  quantity: number;
  customNotes?: string;
  variantDescription?: string;
};

export type CheckoutRequest = {
  method?: CheckoutMethod;
  items: CheckoutItemInput[];
  postalCode?: string;
  shippingOptionId?: ShippingOption["id"];
  address?: string;
  locality?: string;
};

export type ResolvedCheckout = {
  items: CartItem[];
  subtotalPrice: number;
  totalWeightGrams: number;
  totalVolumeCm3: number;
  envelope: CartItem["dimensions"];
  shipping: ShippingOption | null;
  totalPrice: number;
  hasUnpricedItems: boolean;
  hasCustomizableItems: boolean;
  exceedsStandardMail: boolean;
};
