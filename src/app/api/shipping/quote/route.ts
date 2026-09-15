import { NextResponse } from "next/server";
import { hasAndreaniCredentials } from "@/lib/andreani";
import {
  isValidArgentinePostalCode,
  quoteShippingForItems,
  resolveCheckoutItems,
} from "@/features/checkout/resolve";
import type { CheckoutItemInput } from "@/features/checkout/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      postalCode?: string;
      items?: CheckoutItemInput[];
    };
    const postalCode = String(body.postalCode ?? "");

    if (!isValidArgentinePostalCode(postalCode)) {
      return NextResponse.json(
        { error: "Ingresá un código postal argentino de 4 dígitos." },
        { status: 400 },
      );
    }

    if (!hasAndreaniCredentials()) {
      return NextResponse.json(
        {
          error:
            "El envío Andreani todavía no está configurado. Podés consultar el pedido por WhatsApp.",
        },
        { status: 503 },
      );
    }

    const items = await resolveCheckoutItems(body.items ?? []);
    const options = await quoteShippingForItems(items, postalCode);

    return NextResponse.json({ options });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo cotizar el envío.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
