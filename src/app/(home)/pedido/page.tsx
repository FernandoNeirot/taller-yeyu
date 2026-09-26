import type { Metadata } from "next";
import { getSession } from "@/features/admin/services/auth";
import { OrderView, type OrderViewLine } from "@/features/cart/components/order-view";
import { parseOrderSelection } from "@/features/cart/order-link";
import type { CartItem } from "@/features/cart/types";
import { productHref } from "@/features/products/lib/product-url";
import { getProducts } from "@/features/products/services/get-products";
import type { Product } from "@/types/product";

export const metadata: Metadata = {
  title: "Pedido",
  robots: { index: false, follow: false },
};

type PedidoPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function lineFromProduct(product: Product, quantity: number, variant: string, notes: string): CartItem {
  const matchedVariant = product.variants?.find(
    (option) => option.description === variant,
  );

  return {
    id: product.id ?? product.slug,
    slug: product.slug,
    title: product.title,
    featuredImage: product.featuredImage,
    price: matchedVariant?.price ?? product.price,
    quantityPrices: product.quantityPrices,
    variantDescription: variant || undefined,
    quantity,
    customNotes: notes,
    customizable: product.specifications.customizable,
    weightGrams: product.weightGrams ?? 0,
    dimensions: product.dimensions ?? {
      heightCm: 0,
      widthCm: 0,
      lengthCm: 0,
    },
    specificationsDimensions: product.specifications.dimensions,
  };
}

export default async function PedidoPage({ searchParams }: PedidoPageProps) {
  const selection = parseOrderSelection(await searchParams);
  const session = await getSession();
  const products = selection.lines.length > 0 ? await getProducts() : [];
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  const lines: OrderViewLine[] = selection.lines.map((line) => {
    const product = bySlug.get(line.slug) ?? null;
    const cartItem = product
      ? lineFromProduct(product, line.quantity, line.variant, line.notes)
      : null;

    return {
      slug: line.slug,
      title: product?.title ?? line.slug,
      href: product ? productHref(product.slug) : null,
      image: product?.featuredImage ?? null,
      variant: line.variant,
      notes: line.notes,
      dimensions: product?.specifications.dimensions ?? "",
      quantity: line.quantity,
      offer: line.offer,
      unitPrice: cartItem?.price ?? null,
      quantityPrices: cartItem?.quantityPrices ?? [],
      missing: product == null,
    };
  });

  return (
    <main
      id="contenido"
      className="mx-auto w-full max-w-3xl px-container-margin pb-xl"
      style={{ paddingTop: "7rem" }}
    >
      <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface md:font-headline-lg md:text-headline-lg">
        Pedido
      </h1>
      <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
        Esto es lo que el cliente eligió en el carrito.
      </p>

      {lines.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 text-on-surface-variant">
          Este enlace no tiene productos seleccionados.
        </p>
      ) : (
        <OrderView
          canEdit={session != null}
          lines={lines}
          postalCode={selection.postalCode}
          locality={selection.locality}
          address={selection.address}
          shipping={selection.shipping}
          discountType={selection.discountType}
          discountValue={selection.discountValue}
        />
      )}
    </main>
  );
}
