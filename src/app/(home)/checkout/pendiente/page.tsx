import { CheckoutStatus } from "@/components/cart/checkout-status";
import { sharePageMetadata } from "@/lib/seo/metadata";

export const metadata = sharePageMetadata({
  title: "Pago pendiente",
  description: "Tu pago de Mercado Pago está en proceso.",
  path: "/checkout/pendiente",
});

export default function CheckoutPendingPage() {
  return (
    <CheckoutStatus
      title="Pago pendiente"
      message="Mercado Pago todavía está procesando el pago. Te avisamos cuando se acredite."
    />
  );
}
