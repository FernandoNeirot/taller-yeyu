import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

function getAccessToken() {
  const token = process.env.MP_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new Error("Falta MP_ACCESS_TOKEN en el entorno.");
  }
  return token;
}

export function checkoutBaseUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function isLocalCheckout(base: string) {
  return base.includes("localhost") || base.includes("127.0.0.1");
}

export function getMercadoPagoClient() {
  return new MercadoPagoConfig({
    accessToken: getAccessToken(),
    options: { timeout: 8000 },
  });
}

export async function createCheckoutPreference(input: {
  orderId: string;
  items: Array<{
    title: string;
    quantity: number;
    unitPrice: number;
  }>;
  shippingPrice: number;
  shippingLabel?: string;
}) {
  const client = getMercadoPagoClient();
  const preference = new Preference(client);
  const base = checkoutBaseUrl();

  const items = input.items.map((item, index) => ({
    id: `item-${index + 1}`,
    title: item.title.slice(0, 120),
    quantity: item.quantity,
    unit_price: item.unitPrice,
    currency_id: "ARS" as const,
  }));

  if (input.shippingPrice > 0) {
    items.push({
      id: "shipping-andreani",
      title: input.shippingLabel ?? "Envío Andreani",
      quantity: 1,
      unit_price: input.shippingPrice,
      currency_id: "ARS",
    });
  }

  const local = isLocalCheckout(base);
  const created = await preference.create({
    body: {
      items,
      external_reference: input.orderId,
      back_urls: {
        success: `${base}/checkout/exito`,
        failure: `${base}/checkout/error`,
        pending: `${base}/checkout/pendiente`,
      },
      auto_return: local ? undefined : "approved",
      notification_url: local
        ? undefined
        : `${base}/api/mercadopago/webhook`,
      metadata: { orderId: input.orderId },
    },
  });

  if (!created.init_point) {
    throw new Error("Mercado Pago no devolvió el checkout.");
  }

  return {
    id: created.id,
    initPoint: created.init_point,
  };
}

export async function getMercadoPagoPayment(paymentId: string) {
  const payment = new Payment(getMercadoPagoClient());
  return payment.get({ id: paymentId });
}
