import Image from "next/image";
import Link from "next/link";
import { FeaturedProductCard } from "@/components/home/featured-product-card";
import { galleryHref } from "@/features/products/lib/gallery-url";
import { productHref } from "@/features/products/lib/product-url";
import { MaterialIcon } from "@/components/ui/material-icon";
import type { Product } from "@/types/product";

type FeaturedCategoryHeroProps = {
  products: Product[];
};

export function FeaturedCategoryHero({ products }: FeaturedCategoryHeroProps) {
  const categoryHref = galleryHref({ categoria: "infantil-ninos" });

  return (
    <section
      className="overflow-hidden rounded-3xl"
      style={{
        background: "linear-gradient(135deg, #efe0d0 0%, #d7b79a 100%)",
        color: "#3a271c",
        width: "100%",
      }}
    >
      <div className="grid grid-cols-1 gap-3 p-3 md:gap-md md:p-lg lg:grid-cols-2">
        <div className="relative min-h-72 overflow-hidden rounded-3xl md:min-h-80">
          <Image
            alt=""
            src="/principal.webp"
            fill
            loading="lazy"
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
            quality={70}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(19,19,19,0.45) 0%, rgba(19,19,19,0.88) 100%)",
            }}
          />
          <div className="relative z-10 flex h-full flex-col justify-end p-4 md:p-lg">
            <p className="font-label-caps text-label-caps tracking-widest uppercase text-[#f3e6d8]">
              Maternidad y universo infantil
            </p>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white mt-2">
              El cuarto de tu bebé
            </h2>
            <p className="font-body-lg text-body-lg text-[#f3e6d8] mt-sm">
              Piezas cálidas para marcar el crecimiento, jugar y guardar
              recuerdos desde el primer día.
            </p>
            <Link
              href={categoryHref}
              className="touch-target mt-md inline-flex w-full items-center justify-center gap-sm rounded-full px-6 font-label-caps text-label-caps tracking-widest uppercase sm:w-fit"
              style={{ background: "#a0522d", color: "#ffffff" }}
            >
              Ver todo para Bebés
              <MaterialIcon name="arrow_forward" className="text-sm" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-md">
          {products.map((product) => (
            <FeaturedProductCard
              key={product.slug}
              product={product}
              href={productHref(product.slug)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
