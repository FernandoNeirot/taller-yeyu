"use client";

import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { categoryLabel } from "@/types/product";
import type { Product } from "@/types/product";
import { formatProductPrice } from "../lib/format-price";
import { productHref } from "../lib/product-url";
import { ProductWhatsAppCTA } from "./product-whatsapp-cta";
import type { GalleryViewMode } from "./view-toggle";

type ProductCardProps = {
  product: Product;
  viewMode?: GalleryViewMode;
};

export function ProductCard({
  product,
  viewMode = "grid",
}: ProductCardProps) {
  const href = productHref(product.slug);
  const primaryCategory = product.categories[0];
  const isList = viewMode === "list";

  const actions = (
    <div
      className="mt-2 flex w-full items-center gap-1.5"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        width: "100%",
        minWidth: 0,
        marginTop: 8,
      }}
    >
      <AddToCartButton product={product} compact />
      <ProductWhatsAppCTA product={product} compact iconOnly={!isList} />
    </div>
  );

  return (
    <article
      className={
        isList
          ? "overflow-hidden rounded-xl border border-white/5 bg-neutral-900 shadow-md shadow-black/40"
          : "flex h-full flex-col overflow-hidden rounded-xl border border-white/5 bg-neutral-900 shadow-md shadow-black/40"
      }
      style={{ width: "100%", overflow: "hidden" }}
    >
      {isList ? (
        <div
          className="flex flex-row items-stretch overflow-hidden p-2.5"
          style={{ width: "100%", gap: 12, overflow: "hidden", padding: 10 }}
        >
          <Link
            href={href}
            aria-label={`Ver ${product.title}`}
            className="relative shrink-0 overflow-hidden rounded-lg"
            style={{
              width: 112,
              height: 112,
              flexShrink: 0,
            }}
          >
            <Image
              alt={product.title}
              src={product.featuredImage}
              fill
              loading="lazy"
              className="object-cover"
              sizes="112px"
              unoptimized
            />
          </Link>

          <div
            className="flex min-w-0 flex-1 flex-col overflow-hidden"
            style={{ minWidth: 0, overflow: "hidden" }}
          >
            <Link href={href} className="min-w-0 text-left">
              {primaryCategory ? (
                <span className="block truncate text-[10px] leading-tight text-neutral-400">
                  {categoryLabel(primaryCategory)}
                </span>
              ) : null}
              <h3 className="mt-0.5 line-clamp-2 text-xs font-bold leading-tight text-white sm:text-sm">
                {product.title}
              </h3>
              {product.specifications.customizable ? (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-white">
                  <MaterialIcon name="draw" className="text-xs" />
                  Personalizable
                </span>
              ) : null}
              {product.shortDescription ? (
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-neutral-400">
                  {product.shortDescription}
                </p>
              ) : null}
              {product.price != null ? (
                <p className="mt-1 text-xs font-semibold text-primary">
                  {formatProductPrice(product.price)}
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
            className="flex flex-1 flex-col text-left"
            style={{ width: "100%" }}
          >
            <div
              className="relative shrink-0 overflow-hidden"
              style={{ width: "100%", aspectRatio: "4 / 3" }}
            >
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
                <span
                  className="inline-flex items-center justify-center rounded-full bg-black/70 text-white"
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 28,
                    height: 28,
                  }}
                  title="Personalizable"
                >
                  <MaterialIcon name="draw" className="text-sm" />
                </span>
              ) : null}
            </div>

            <div
              className="flex flex-1 flex-col p-2.5"
              style={{ width: "100%", padding: 10, minWidth: 0 }}
            >
              {primaryCategory ? (
                <span className="block truncate text-[10px] leading-tight text-neutral-400">
                  {categoryLabel(primaryCategory)}
                </span>
              ) : null}
              <h3 className="mt-1 line-clamp-2 text-xs font-bold leading-tight text-white">
                {product.title}
              </h3>
              {product.price != null ? (
                <p className="mt-1 text-xs font-semibold text-primary">
                  {formatProductPrice(product.price)}
                </p>
              ) : null}
            </div>
          </Link>
          <div style={{ width: "100%", padding: "0 10px 10px", minWidth: 0 }}>
            {actions}
          </div>
        </>
      )}
    </article>
  );
}
