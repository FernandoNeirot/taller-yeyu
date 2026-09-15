import type { CartItem } from "@/features/cart/types";
import { packageVolumeCm3, type PackageSize } from "@/features/products/lib/logistics";

export function cartItemKey(id: string, customNotes = "") {
  return `${id}::${customNotes.trim()}`;
}

export function computeCartTotals(items: CartItem[]) {
  const subtotalPrice = items.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.quantity,
    0,
  );
  const totalWeightGrams = items.reduce(
    (sum, item) => sum + item.weightGrams * item.quantity,
    0,
  );
  const totalVolumeCm3 = items.reduce(
    (sum, item) => sum + packageVolumeCm3(item.dimensions) * item.quantity,
    0,
  );

  const envelope: PackageSize = items.reduce(
    (acc, item) => ({
      lengthCm: Math.max(acc.lengthCm, item.dimensions.lengthCm),
      widthCm: Math.max(acc.widthCm, item.dimensions.widthCm),
      heightCm: acc.heightCm + item.dimensions.heightCm * item.quantity,
    }),
    { lengthCm: 0, widthCm: 0, heightCm: 0 },
  );

  return {
    subtotalPrice,
    totalWeightGrams,
    totalVolumeCm3,
    envelope,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}
