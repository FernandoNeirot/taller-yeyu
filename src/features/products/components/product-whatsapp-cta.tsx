"use client";

import { useState } from "react";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import type { Product } from "@/types/product";
import { ProductInquiryModal } from "./product-inquiry-modal";

export function ProductWhatsAppCTA({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <WhatsAppButton
        variant="secondary"
        fullWidth
        onClick={() => setOpen(true)}
      >
        Consultar
      </WhatsAppButton>
      {open ? (
        <ProductInquiryModal
          product={product}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
