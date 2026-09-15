import { FieldValue } from "firebase-admin/firestore";
import { ORDERS_COLLECTION, getAdminFirestore } from "@/lib/firebase-admin";
import type { CartItem, ShippingOption } from "@/features/cart/types";
import type { CheckoutMethod } from "./types";

export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "whatsapp"
  | "cancelled";

export type StoredOrder = {
  id: string;
  status: OrderStatus;
  method: CheckoutMethod;
  items: CartItem[];
  subtotalPrice: number;
  shipping: ShippingOption | null;
  totalPrice: number;
  postalCode?: string;
  address?: string;
  locality?: string;
  mpPreferenceId?: string;
  mpPaymentId?: string;
  mpStatus?: string;
};

export async function createOrder(
  order: Omit<StoredOrder, "id"> & { id?: string },
) {
  const id = order.id ?? crypto.randomUUID();
  await getAdminFirestore()
    .collection(ORDERS_COLLECTION)
    .doc(id)
    .set({
      ...order,
      id,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  return id;
}

export async function updateOrder(
  id: string,
  patch: Partial<StoredOrder> & Record<string, unknown>,
) {
  await getAdminFirestore()
    .collection(ORDERS_COLLECTION)
    .doc(id)
    .update({
      ...patch,
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function findOrderByPreference(preferenceId: string) {
  const snapshot = await getAdminFirestore()
    .collection(ORDERS_COLLECTION)
    .where("mpPreferenceId", "==", preferenceId)
    .limit(1)
    .get();

  return snapshot.docs[0]?.id ?? null;
}
