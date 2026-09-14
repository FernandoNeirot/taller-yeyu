import Image from "next/image";
import Link from "next/link";
import { FeaturedProductCard } from "@/components/home/featured-product-card";
import { galleryHref } from "@/features/products/lib/gallery-url";
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md p-md md:p-lg">
        <div className="relative min-h-72 overflow-hidden rounded-3xl">
          <Image
            alt="El cuarto de tu bebé"
            src="/principal.png"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
            unoptimized
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(58,39,28,0.15) 0%, rgba(58,39,28,0.78) 100%)",
            }}
          />
          <div className="relative z-10 flex h-full flex-col justify-end p-lg">
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
              className="mt-md inline-flex w-fit items-center gap-sm rounded-full px-6 py-3 font-label-caps text-label-caps tracking-widest uppercase"
              style={{ background: "#a0522d", color: "#fff2ec" }}
            >
              Ver todo para Bebés
              <MaterialIcon name="arrow_forward" className="text-sm" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-sm md:gap-md">
          {products.map((product) => (
            <FeaturedProductCard
              key={product.slug}
              product={product}
              href={galleryHref({
                categoria: "infantil-ninos",
                producto: product.slug,
              })}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
