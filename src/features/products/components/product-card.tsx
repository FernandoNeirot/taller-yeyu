"use client";

import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { categoryLabel } from "@/types/product";
import type { Product } from "@/types/product";
import { formatProductPrice } from "../lib/format-price";
import { normalizePackOptions, packRangeLabel } from "../lib/packs";
import { normalizeVariants } from "../lib/variants";
import { productHref } from "../lib/product-url";
import { ProductWhatsAppCTA } from "./product-whatsapp-cta";
import type { GalleryViewMode } from "./view-toggle";

function catalogPriceLabel(product: Product) {
  const packs = normalizePackOptions(product.packOptions);
  if (packs?.length) {
    const lowest = Math.min(...packs.map((option) => option.price));
    const from = packs.length > 1 ? "Desde " : "";
    return `${from}${formatProductPrice(lowest)} · ${packRangeLabel(packs)}`;
  }
  const amounts: number[] = [];
  if (product.price != null) amounts.push(product.price);
  for (const tier of product.quantityPrices ?? []) amounts.push(tier.price);
  for (const option of normalizeVariants(product.variants) ?? []) {
    amounts.push(option.price);
  }
  if (amounts.length === 0) return null;
  const lowest = Math.min(...amounts);
  if (amounts.length > 1) return `Desde ${formatProductPrice(lowest)}`;
  return formatProductPrice(lowest);
}

type ProductCardProps = {
  product: Product;
  viewMode?: GalleryViewMode;
  priority?: boolean;
};

export function ProductCard({
  product,
  viewMode = "grid",
  priority = false,
}: ProductCardProps) {
  const href = productHref(product.slug);
  const priceLabel = catalogPriceLabel(product);
  const primaryCategory = product.categories[0];
  const isList = viewMode === "list";

  const actions = (
    <div className="mt-2 flex w-full min-w-0 flex-row items-center gap-1.5">
      <AddToCartButton product={product} compact />
      <ProductWhatsAppCTA product={product} compact iconOnly={!isList} />
    </div>
  );

  return (
    <article
      className={
        isList
          ? "w-full overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-md shadow-stone-900/10"
          : "flex h-full w-full flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-md shadow-stone-900/10"
      }
    >
      {isList ? (
        <div className="flex w-full flex-row items-stretch gap-3 overflow-hidden p-2.5">
          <Link
            href={href}
            aria-label={`Ver ${product.title}`}
            className="relative size-28 shrink-0 overflow-hidden rounded-lg"
          >
            <Image
              alt=""
              src={product.featuredImage}
              fill
              priority={priority}
              loading={priority ? undefined : "lazy"}
              className="object-cover"
              sizes="112px"
            />
          </Link>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Link href={href} className="min-w-0 text-left">
              {primaryCategory ? (
                <span className="block truncate text-[10px] leading-tight text-on-surface-variant">
                  {categoryLabel(primaryCategory)}
                </span>
              ) : null}
              <h3 className="mt-0.5 line-clamp-2 text-xs font-bold leading-tight text-on-surface sm:text-sm">
                {product.title}
              </h3>
              {product.specifications.customizable ? (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] text-on-surface">
                  <MaterialIcon name="draw" className="text-xs" />
                  Personalizable
                </span>
              ) : null}
              {product.shortDescription ? (
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-on-surface-variant">
                  {product.shortDescription}
                </p>
              ) : null}
              {priceLabel ? (
                <p className="mt-1 text-xs font-semibold text-primary">
                  {priceLabel}
                </p>
              ) : null}
            </Link>
            {actions}
          </div>
        </div>
      ) : (
        <>
          <Link
            href={href}
            aria-label={`Ver ${product.title}`}
            className="flex w-full flex-1 flex-col text-left"
          >
            <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden">
              <Image
                alt=""
                src={product.featuredImage}
                fill
                priority={priority}
                loading={priority ? undefined : "lazy"}
                className="object-cover"
                sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
              />
              {product.specifications.customizable ? (
                <span
                  className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-black/70 text-white"
                  title="Personalizable"
                >
                  <MaterialIcon name="draw" className="text-sm" />
                </span>
              ) : null}
            </div>

            <div className="flex w-full min-w-0 flex-1 flex-col p-2.5">
              {primaryCategory ? (
                <span className="block truncate text-[10px] leading-tight text-on-surface-variant">
                  {categoryLabel(primaryCategory)}
                </span>
              ) : null}
              <h3 className="mt-1 line-clamp-2 text-xs font-bold leading-tight text-on-surface">
                {product.title}
              </h3>
              {priceLabel ? (
                <p className="mt-1 text-xs font-semibold text-primary">
                  {priceLabel}
                </p>
              ) : null}
            </div>
          </Link>
          <div className="w-full min-w-0 px-2.5 pb-2.5">
            {actions}
          </div>
        </>
      )}
    </article>
  );
}
