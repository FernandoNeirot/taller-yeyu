import { createHmac, timingSafeEqual } from "node:crypto";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

function getAccessToken() {
  const token = process.env.MP_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new Error("Falta MP_ACCESS_TOKEN en el entorno.");
  }
  return token;
}

export function getMercadoPagoPublicKey() {
  return process.env.NEXT_PUBLIC_MP_PUBLIC_KEY?.trim() ?? "";
}

function isPlaceholderSecret(value: string) {
  return (
    !value ||
    value.startsWith("tu_") ||
    value.includes("000000") ||
    value === "xxx"
  );
}

export function checkoutBaseUrl() {
  const fromEnv = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    ""
  ).replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function isLocalCheckout(base: string) {
  return base.includes("localhost") || base.includes("127.0.0.1");
}

export function verifyMercadoPagoWebhook(request: Request, dataId: string) {
  const secret = process.env.MP_WEBHOOK_SECRET?.trim() ?? "";
  if (isPlaceholderSecret(secret)) return true;

  const xSignature = request.headers.get("x-signature") ?? "";
  const xRequestId = request.headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [key, ...rest] = part.split("=");
      return [key.trim(), rest.join("=").trim()];
    }),
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1 || !dataId) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const hash = createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    const expected = Buffer.from(hash);
    const received = Buffer.from(v1);
    return (
      expected.length === received.length &&
      timingSafeEqual(expected, received)
    );
  } catch {
    return false;
  }
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
