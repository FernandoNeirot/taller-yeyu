import Link from "next/link";
import { FeaturedProductCard } from "@/components/home/featured-product-card";
import { galleryHref } from "@/features/products/lib/gallery-url";
import { productHref } from "@/features/products/lib/product-url";
import { MaterialIcon } from "@/components/ui/material-icon";
import type { Product } from "@/types/product";

type FeaturedCategorySlimProps = {
  products: Product[];
};

export function FeaturedCategorySlim({ products }: FeaturedCategorySlimProps) {
  const categoryHref = galleryHref({
    categoria: "organizadores-utilitarios",
  });

  return (
    <section className="rounded-2xl border border-outline-variant/25 bg-surface-container-low p-3 md:rounded-3xl md:p-lg">
      <div className="flex flex-col gap-sm md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-label-caps text-label-caps tracking-widest uppercase text-secondary">
            Organizadores y utilitarios
          </p>
          <h2 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-on-surface mt-1">
            Soluciones de orden para el hogar y oficina
          </h2>
        </div>
        <Link
          href={categoryHref}
          className="touch-target inline-flex items-center gap-sm font-label-caps text-label-caps tracking-widest uppercase text-primary hover:text-secondary"
        >
          Ver todos los Organizadores
          <MaterialIcon name="arrow_forward" className="text-sm" />
        </Link>
      </div>

      <div className="product-carousel hide-scrollbar mt-md snap-x snap-mandatory overflow-x-auto md:hidden">
        {products.map((product) => (
          <div
            key={product.slug}
            className="product-carousel-item-compact snap-start"
          >
            <FeaturedProductCard
              compact
              product={product}
              href={productHref(product.slug)}
            />
          </div>
        ))}
      </div>

      <div className="mt-lg hidden md:grid md:grid-cols-3 md:gap-md lg:grid-cols-5">
        {products.map((product) => (
          <FeaturedProductCard
            compact
            key={product.slug}
            product={product}
            href={productHref(product.slug)}
          />
        ))}
      </div>
    </section>
  );
}
