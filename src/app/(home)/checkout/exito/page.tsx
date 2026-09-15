import { CheckoutStatus } from "@/components/cart/checkout-status";
import { sharePageMetadata } from "@/lib/seo/metadata";

export const metadata = sharePageMetadata({
  title: "Pago aprobado",
  description: "Recibimos tu pago de Mercado Pago.",
  path: "/checkout/exito",
});

export default function CheckoutSuccessPage() {
  return (
    <CheckoutStatus
      title="Pago aprobado"
      message="Gracias por tu pedido. Vamos a preparar las piezas y te vamos a contactar con el seguimiento."
      clearCartOnMount
    />
  );
}
