import { formatProductPrice } from "@/features/products/lib/format-price";
import type { CartItem, ShippingOption } from "@/features/cart/types";

export function buildCartWhatsAppMessage(input: {
  items: CartItem[];
  subtotalPrice: number;
  shipping: ShippingOption | null;
  postalCode?: string;
  locality?: string;
  address?: string;
}) {
  const lines = input.items.map((item) => {
    const price =
      item.price != null
        ? formatProductPrice(item.price * item.quantity)
        : "a cotizar";
    const notes = item.customNotes
      ? `\n   Notas: ${item.customNotes}`
      : item.customizable
        ? "\n   Notas: requiere cotización especial de diseño"
        : "";
    return `• ${item.title} x${item.quantity} (${item.specificationsDimensions || "medidas a confirmar"}) — ${price}${notes}`;
  });

  const shippingLine = input.shipping
    ? `${input.shipping.label} — ${formatProductPrice(input.shipping.price)}${
        input.shipping.estimatedDays ? ` (${input.shipping.estimatedDays})` : ""
      }`
    : input.postalCode
      ? `Código postal ${input.postalCode}: falta confirmar tarifa de envío`
      : "";

  const destination = [input.locality, input.address].filter(Boolean).join(" — ");
  const total = input.subtotalPrice + (input.shipping?.price ?? 0);
  const unpriced = input.items.some((item) => item.price == null);
  const extras = [
    shippingLine ? `🚚 ${shippingLine}` : "",
    destination ? `📍 Destino: ${destination}` : "",
    unpriced ? "⚠️ Hay piezas personalizadas o sin precio publicado." : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `Hola! Quiero encargar este pedido desde la web de Taller Yeyu.

📦 Productos:
${lines.join("\n")}

💰 ${unpriced ? "Total: a cotizar" : `Total: ${formatProductPrice(total)}`}${extras ? `\n${extras}` : ""}

¿Me confirman disponibilidad, tiempo de producción y cómo coordinamos el envío?`;
}
