export const DEFAULT_WHATSAPP_PHONE = "541139009696";

export type WhatsAppLinkOptions = {
  phoneNumber: string;
  message?: string;
};

export type ProductInquiry = {
  neededBy: string;
  quantity: string;
  topic: string;
  address: string;
  description: string;
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

function formatInquiryDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;

  return new Date(year, month - 1, day).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function productWhatsAppMessage(
  product: { title: string; slug: string },
  inquiry?: ProductInquiry,
) {
  const productLink = `https://talleryeyu.com/producto/${product.slug}`;

  if (!inquiry) {
    return `Hola! Me interesa consultar por el producto "${product.title}" (Ref: ${product.slug}).
${productLink}

¿Tienen disponibilidad y tiempo estimado de entrega?`;
  }

  return `Hola! Me interesa consultar por el producto "${product.title}" (Ref: ${product.slug}).
${productLink}

📅 Fecha en que lo necesita: ${formatInquiryDate(inquiry.neededBy)}
🔢 Cantidad: ${inquiry.quantity}
🎨 Temática: ${inquiry.topic}
📍 Dirección: ${inquiry.address}
📝 Descripción: ${inquiry.description}

¿Me podrán asesorar con el presupuesto y tiempo de entrega?`;
}
