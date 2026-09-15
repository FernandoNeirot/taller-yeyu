import { NextResponse } from "next/server";
import { createOrder, updateOrder } from "@/features/checkout/orders";
import { resolveCheckout } from "@/features/checkout/resolve";
import type { CheckoutRequest } from "@/features/checkout/types";
import { createCheckoutPreference } from "@/lib/mercadopago";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequest;
    const method = body.method === "whatsapp" ? "whatsapp" : "mercadopago";
    const checkout = await resolveCheckout({
      ...body,
      shippingOptionId:
        method === "whatsapp" ? undefined : body.shippingOptionId,
    });

    if (method === "mercadopago") {
      if (checkout.hasUnpricedItems || checkout.subtotalPrice <= 0) {
        return NextResponse.json(
          {
            error:
              "Hay productos sin precio publicado. Consultá el pedido por WhatsApp.",
          },
          { status: 400 },
        );
      }

      if (!process.env.MP_ACCESS_TOKEN?.trim()) {
        return NextResponse.json(
          {
            error:
              "Mercado Pago todavía no está configurado. Usá WhatsApp para encargar.",
          },
          { status: 503 },
        );
      }

      const orderId = await createOrder({
        status: "pending",
        method,
        items: checkout.items,
        subtotalPrice: checkout.subtotalPrice,
        shipping: checkout.shipping,
        totalPrice: checkout.totalPrice,
        postalCode: body.postalCode,
        address: body.address,
        locality: body.locality,
      });

      const preference = await createCheckoutPreference({
        orderId,
        items: checkout.items.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          unitPrice: item.price ?? 0,
        })),
        shippingPrice: checkout.shipping?.price ?? 0,
        shippingLabel: checkout.shipping?.label,
      });

      await updateOrder(orderId, { mpPreferenceId: preference.id });

      return NextResponse.json({
        method,
        orderId,
        initPoint: preference.initPoint,
      });
    }

    const orderId = await createOrder({
      status: "whatsapp",
      method,
      items: checkout.items,
      subtotalPrice: checkout.subtotalPrice,
      shipping: checkout.shipping,
      totalPrice: checkout.totalPrice,
      postalCode: body.postalCode,
      address: body.address,
      locality: body.locality,
    });

    return NextResponse.json({ method, orderId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo iniciar el checkout.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
