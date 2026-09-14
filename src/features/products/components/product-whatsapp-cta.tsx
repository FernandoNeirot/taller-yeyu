import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { productWhatsAppMessage } from "@/lib/whatsapp";
import type { Product } from "@/types/product";

export function ProductWhatsAppCTA({ product }: { product: Product }) {
  return (
    <WhatsAppButton
      message={productWhatsAppMessage(product)}
      variant="secondary"
      fullWidth
    >
      Consultar por este Producto
    </WhatsAppButton>
  );
}
