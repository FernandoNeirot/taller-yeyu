import { CheckoutStatus } from "@/components/cart/checkout-status";
import { sharePageMetadata } from "@/lib/seo/metadata";

export const metadata = sharePageMetadata({
  title: "Pago no completado",
  description: "El pago con Mercado Pago no se completó.",
  path: "/checkout/error",
});

export default function CheckoutErrorPage() {
  return (
    <CheckoutStatus
      title="No se completó el pago"
      message="Podés volver al carrito e intentar de nuevo, o consultar el pedido por WhatsApp."
    />
  );
}
