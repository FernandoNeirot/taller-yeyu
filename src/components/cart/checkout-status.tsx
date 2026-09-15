"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

export function CheckoutStatus({
  title,
  message,
  clearCartOnMount = false,
}: {
  title: string;
  message: string;
  clearCartOnMount?: boolean;
}) {
  const { clearCart } = useCart();

  useEffect(() => {
    if (clearCartOnMount) clearCart();
  }, [clearCart, clearCartOnMount]);

  return (
    <main
      className="mx-auto max-w-xl px-container-margin py-xl"
      style={{ paddingTop: "7rem" }}
    >
      <h1 className="font-headline-lg text-headline-lg text-on-surface">{title}</h1>
      <p className="mt-3 font-body-md text-body-md text-on-surface-variant">
        {message}
      </p>
      <Link
        href="/galeria"
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 text-on-primary"
        style={{ minHeight: 44 }}
      >
        Volver a la galería
      </Link>
    </main>
  );
}
