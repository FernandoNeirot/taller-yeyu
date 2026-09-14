"use client";

import Image from "next/image";
import { useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { categoryLabel } from "@/types/product";
import type { Product } from "@/types/product";
import { ProductWhatsAppCTA } from "./product-whatsapp-cta";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const [showSpecs, setShowSpecs] = useState(false);
  const primaryCategory = product.categories[0];

  return (
    <article className="h-full flex flex-col overflow-hidden rounded-xl bg-surface-container border border-outline-variant/20">
      <div className="relative aspect-square w-full shrink-0">
        <Image
          alt={product.title}
          src={product.featuredImage}
          fill
          loading="lazy"
          className="object-cover"
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
          unoptimized
        />
        {product.specifications.customizable ? (
          <span className="absolute left-2 top-2 inline-flex max-w-[calc(100%-1rem)] items-center gap-1 truncate rounded-full bg-primary-container px-2 py-1 font-label-caps text-label-caps text-on-primary-container">
            <MaterialIcon name="draw" className="shrink-0 text-sm" />
            <span className="truncate">Personalizable</span>
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-2.5 bg-surface-container-high md:p-3">
        {primaryCategory ? (
          <span className="rounded-full bg-surface-container px-2 py-0.5 font-label-caps text-label-caps text-secondary tracking-widest truncate">
            {categoryLabel(primaryCategory)}
          </span>
        ) : null}

        <h3 className="mt-2 font-headline-md text-[15px] leading-snug text-on-surface line-clamp-2 md:text-headline-md md:leading-tight">
          {product.title}
        </h3>
        <p className="mt-1 hidden font-body-md text-body-md text-on-surface-variant line-clamp-2 sm:block">
          {product.shortDescription}
        </p>

        {showSpecs ? (
          <dl className="mt-3 space-y-1 font-body-md text-body-md text-on-surface-variant">
            <div>
              <dt className="inline font-label-caps text-label-caps text-secondary tracking-widest">
                Material:{" "}
              </dt>
              <dd className="inline">{product.specifications.material}</dd>
            </div>
            <div>
              <dt className="inline font-label-caps text-label-caps text-secondary tracking-widest">
                Medidas:{" "}
              </dt>
              <dd className="inline">{product.specifications.dimensions}</dd>
            </div>
            <div>
              <dt className="inline font-label-caps text-label-caps text-secondary tracking-widest">
                Acabado:{" "}
              </dt>
              <dd className="inline">{product.specifications.finish}</dd>
            </div>
          </dl>
        ) : null}

        <div className="mt-auto pt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowSpecs((open) => !open)}
            className="touch-target inline-flex w-full items-center justify-center gap-1 rounded border border-primary px-2 text-center text-primary font-label-caps text-label-caps tracking-widest hover:bg-primary/10 transition-colors"
          >
            {showSpecs ? "Ocultar especificaciones" : "Ver especificaciones"}
          </button>

          <ProductWhatsAppCTA product={product} />
        </div>
      </div>
    </article>
  );
}
