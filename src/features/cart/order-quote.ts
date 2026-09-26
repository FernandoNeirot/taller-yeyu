import type { ProductQuantityPrice } from "@/features/products/lib/quantity-prices";
import { priceForQuantity } from "@/features/products/lib/quantity-prices";
import type { OrderDiscountType } from "./order-link";

export function catalogLineTotal(
  line: { unitPrice: number | null; quantityPrices: ProductQuantityPrice[] },
  quantity: number,
) {
  const tier = priceForQuantity(line.quantityPrices, quantity);
  if (tier) return tier.price;
  if (line.unitPrice == null) return null;
  return line.unitPrice * quantity;
}

export function offeredLineTotal(catalog: number | null, offer: number | null) {
  if (offer != null && offer > 0) return offer;
  return catalog;
}

export function orderDiscountAmount(
  subtotal: number,
  type: OrderDiscountType,
  value: number,
) {
  if (subtotal <= 0 || value <= 0) return 0;
  if (type === "porcentaje") {
    return Math.round((subtotal * Math.min(100, value)) / 100);
  }
  return Math.min(subtotal, Math.round(value));
}
