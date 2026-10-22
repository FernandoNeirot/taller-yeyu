import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
  href: string;
  /** Marca la imagen como LCP (primeras tarjetas visibles). */
  preload?: boolean;
};

const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function ProductCard({ product, href, preload = false }: ProductCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-stone-200/50 focus-visible:scale-[1.02] focus-visible:shadow-xl focus-visible:shadow-stone-200/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none motion-reduce:hover:scale-100"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-surface-container-low">
        <Image
          src={product.featuredImage}
          alt={product.title}
          fill
          quality={75}
          preload={preload}
          sizes="(max-width: 767px) 85vw, (min-width: 1024px) 25vw, 50vw"
          className="object-cover"
        />
        {/* Luz rasante: aviva el calado sin tapar la foto */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-stone-900/5"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 md:p-4">
        <h3 className="font-headline-md text-sm leading-snug text-on-surface line-clamp-2 md:text-headline-md md:leading-tight">
          {product.title}
        </h3>
        <p className="hidden font-body-md text-body-md text-on-surface-variant line-clamp-2 sm:block">
          {product.shortDescription}
        </p>
        {typeof product.price === "number" ? (
          <p className="mt-auto pt-2 font-label-caps text-label-caps tracking-widest text-primary">
            {priceFormatter.format(product.price)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
