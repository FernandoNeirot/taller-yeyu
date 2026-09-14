"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { categoryLabel } from "@/types/product";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

function getWhatsAppUrl(title: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  const message = `Hola Taller Yeyu, quiero cotizar: ${title}`;

  if (!number) {
    return "/#contacto";
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [showSpecs, setShowSpecs] = useState(false);
  const quoteUrl = useMemo(
    () => getWhatsAppUrl(product.title),
    [product.title],
  );

  return (
    <article className="h-full flex flex-col overflow-hidden rounded-xl bg-surface-container border border-outline-variant/20">
      <div className="relative aspect-square w-full shrink-0">
        <Image
          alt={product.title}
          src={product.featuredImage}
          fill
          className="object-cover"
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
          unoptimized
          priority={priority}
        />
        {product.specifications.customizable ? (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary-container px-2 py-1 font-label-caps text-label-caps text-on-primary-container">
            <MaterialIcon name="draw" className="text-sm" />
            Personalizable
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3 bg-surface-container-high">
        <div className="flex flex-wrap gap-1">
          {product.categories.map((category) => (
            <span
              key={category}
              className="rounded-full bg-surface-container px-2 py-0.5 font-label-caps text-label-caps text-secondary tracking-widest"
            >
              {categoryLabel(category)}
            </span>
          ))}
        </div>

        <h3 className="font-headline-md text-headline-md text-on-surface mt-2 leading-tight line-clamp-2 min-h-16">
          {product.title}
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1 line-clamp-2">
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
            className="inline-flex w-full items-center justify-center gap-1 rounded py-2.5 border border-primary text-primary font-label-caps text-label-caps tracking-widest hover:bg-primary/10 transition-colors"
          >
            {showSpecs ? "Ocultar especificaciones" : "Ver especificaciones / Cotizar"}
          </button>

          {showSpecs ? (
            <a
              href={quoteUrl}
              target={quoteUrl.startsWith("http") ? "_blank" : undefined}
              rel={quoteUrl.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-flex w-full items-center justify-center gap-1 rounded py-2.5 bg-primary text-on-primary font-label-caps text-label-caps tracking-widest hover:bg-primary-fixed transition-colors"
            >
              Cotizar
              <MaterialIcon name="arrow_forward" className="text-sm" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
