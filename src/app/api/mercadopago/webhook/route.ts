import { NextResponse } from "next/server";
import { updateOrder } from "@/features/checkout/orders";
import { getMercadoPagoPayment } from "@/lib/mercadopago";

function paymentStatus(status: string | undefined) {
  if (status === "approved") return "paid" as const;
  if (status === "rejected" || status === "cancelled") return "failed" as const;
  return "pending" as const;
}

async function processPayment(paymentId: string) {
  const payment = await getMercadoPagoPayment(paymentId);
  const orderId = String(
    payment.external_reference ??
      (payment.metadata as { orderId?: string } | undefined)?.orderId ??
      "",
  ).trim();

  if (!orderId) return;

  await updateOrder(orderId, {
    status: paymentStatus(payment.status),
    mpPaymentId: String(payment.id ?? paymentId),
    mpStatus: payment.status,
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const paymentId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  const topic = url.searchParams.get("type") ?? url.searchParams.get("topic");

  if (paymentId && (topic === "payment" || !topic)) {
    try {
      await processPayment(paymentId);
    } catch (error) {
      console.error("Webhook Mercado Pago (GET)", error);
    }
  }

  return NextResponse.json({ received: true });
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const body = (await request.json().catch(() => ({}))) as {
      type?: string;
      action?: string;
      data?: { id?: string | number };
    };
    const paymentId = String(
      body.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "",
    );
    const topic = body.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");

    if (paymentId && (topic === "payment" || body.action?.startsWith("payment"))) {
      await processPayment(paymentId);
    }
  } catch (error) {
    console.error("Webhook Mercado Pago (POST)", error);
  }

  return NextResponse.json({ received: true });
}
