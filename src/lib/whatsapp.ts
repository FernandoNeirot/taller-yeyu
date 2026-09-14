export const DEFAULT_WHATSAPP_PHONE = "541139009696";

export type WhatsAppLinkOptions = {
  phoneNumber: string;
  message?: string;
};

export function getWhatsAppPhoneNumber() {
  const fromEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  return fromEnv || DEFAULT_WHATSAPP_PHONE;
}

export function buildWhatsAppLink({
  phoneNumber,
  message,
}: WhatsAppLinkOptions) {
  const cleanNumber = phoneNumber.replace(/\D/g, "");

  if (!cleanNumber) {
    return "#";
  }

  const baseUrl = `https://wa.me/${cleanNumber}`;

  if (!message) {
    return baseUrl;
  }

  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

export function customWorkWhatsAppMessage() {
  return `Hola! Estuve viendo la web y tengo una idea para un producto a medida.

📌 Descripción de mi proyecto:
- Material deseado: MDF / Acrílico
- Cantidad aproximada:

¿Me podrán asesorar con el presupuesto?`;
}

export function productWhatsAppMessage(product: {
  title: string;
  slug: string;
}) {
  return `Hola! Me interesa consultar por el producto "${product.title}" (Ref: ${product.slug}).

¿Tienen disponibilidad y tiempo estimado de entrega?`;
}
