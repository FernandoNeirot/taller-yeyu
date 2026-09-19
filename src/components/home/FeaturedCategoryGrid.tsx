import Link from "next/link";
import { FeaturedProductCard } from "@/components/home/featured-product-card";
import { galleryHref } from "@/features/products/lib/gallery-url";
import { productHref } from "@/features/products/lib/product-url";
import { MaterialIcon } from "@/components/ui/material-icon";
import { topicLabel } from "@/types/product";
import type { Product } from "@/types/product";

type FeaturedCategoryGridProps = {
  products: Product[];
  topics: { id: string; label?: string }[];
};

export function FeaturedCategoryGrid({
  products,
  topics,
}: FeaturedCategoryGridProps) {
  const categoryHref = galleryHref({ categoria: "eventos-souvenirs" });

  return (
    <section className="rounded-3xl border border-tertiary/30 bg-surface-container p-3 md:p-lg">
      <div className="flex flex-col gap-sm text-center">
        <p className="font-label-caps text-label-caps tracking-widest uppercase text-tertiary">
          Eventos y celebraciones
        </p>
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
          Tu evento inolvidable
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Cumpleaños, comuniones, bodas y fiestas con centros de mesa, toppers y
          souvenirs a medida.
        </p>
      </div>

      <div className="mt-md flex flex-wrap justify-center gap-2">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={galleryHref({
              categoria: "eventos-souvenirs",
              topic: topic.id,
            })}
            className="touch-target inline-flex items-center justify-center rounded-full border border-tertiary/50 px-4 font-label-caps text-label-caps tracking-widest text-tertiary hover:bg-tertiary/10"
          >
            {topic.label ?? topicLabel(topic.id)}
          </Link>
        ))}
      </div>

      <div className="mt-lg grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-md">
        {products.map((product) => (
          <FeaturedProductCard
            key={product.slug}
            product={product}
            href={productHref(product.slug)}
          />
        ))}
      </div>

      <div className="mt-lg flex justify-center">
        <Link
          href={categoryHref}
          className="touch-target inline-flex w-full items-center justify-center gap-sm rounded-full bg-tertiary-container px-6 text-center font-label-caps text-label-caps tracking-widest uppercase text-on-tertiary-container hover:opacity-90 sm:w-auto"
        >
          Ver catálogo completo de Eventos
          <MaterialIcon name="arrow_forward" className="text-sm" />
        </Link>
      </div>
    </section>
  );
}
