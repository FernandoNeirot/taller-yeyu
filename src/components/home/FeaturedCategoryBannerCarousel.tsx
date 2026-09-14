import Image from "next/image";
import Link from "next/link";
import { FeaturedProductCard } from "@/components/home/featured-product-card";
import { galleryHref } from "@/features/products/lib/gallery-url";
import { MaterialIcon } from "@/components/ui/material-icon";
import type { Product } from "@/types/product";

type FeaturedCategoryBannerCarouselProps = {
  products: Product[];
};

export function FeaturedCategoryBannerCarousel({
  products,
}: FeaturedCategoryBannerCarouselProps) {
  const categoryHref = galleryHref({ categoria: "decoracion-hogar" });

  return (
    <section className="overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-container-lowest">
      <div className="relative min-h-64 overflow-hidden">
        <Image
          alt="Living con piezas de decoración en madera"
          src="/principal.png"
          fill
          className="object-cover opacity-50"
          sizes="100vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-linear-to-r from-background via-background/80 to-transparent" />
        <div className="relative z-10 flex h-full min-h-64 flex-col justify-center px-lg py-xl">
          <p className="font-label-caps text-label-caps tracking-widest uppercase text-secondary">
            Hogar y decoración
          </p>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mt-2">
            Transformá tus ambientes
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-sm max-w-xl">
            Calados, veladores y piezas de pared con un look moderno para living,
            dormitorio o recibidor.
          </p>
          <Link
            href={categoryHref}
            className="mt-md inline-flex w-fit items-center gap-sm rounded-full border border-primary px-6 py-3 font-label-caps text-label-caps tracking-widest uppercase text-primary hover:bg-primary/10"
          >
            Explorar Decoración
            <MaterialIcon name="arrow_forward" className="text-sm" />
          </Link>
        </div>
      </div>

      <div
        className="hide-scrollbar flex gap-md p-md md:p-lg"
        style={{
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {products.map((product) => (
          <div key={product.slug} style={{ scrollSnapAlign: "start" }}>
            <FeaturedProductCard
              carousel
              product={product}
              href={galleryHref({
                categoria: "decoracion-hogar",
                producto: product.slug,
              })}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
