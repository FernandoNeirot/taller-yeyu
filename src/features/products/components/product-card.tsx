"use client";

import Image from "next/image";
import { useState } from "react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { categoryLabel } from "@/types/product";
import type { Product } from "@/types/product";
import { formatProductPrice } from "../lib/format-price";
import { ProductDetailModal } from "./product-detail-modal";
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
  const [showDetail, setShowDetail] = useState(false);
  const primaryCategory = product.categories[0];
  const isList = viewMode === "list";

  return (
    <article
      className={
        isList
          ? "overflow-hidden rounded-xl border border-white/5 bg-neutral-900 shadow-md shadow-black/40"
          : "flex h-full flex-col overflow-hidden rounded-xl border border-white/5 bg-neutral-900 shadow-md shadow-black/40"
      }
      style={{ width: "100%" }}
    >
      {isList ? (
        <div
          className="flex flex-row items-stretch overflow-hidden p-2"
          style={{ width: "100%", gap: 12 }}
        >
          <button
            type="button"
            onClick={() => setShowDetail(true)}
            aria-label={`Ver ${product.title}`}
            className="relative shrink-0 overflow-hidden rounded-lg"
            style={{
              width: 112,
              height: 112,
              flexShrink: 0,
              cursor: "pointer",
              background: "transparent",
              border: 0,
              padding: 0,
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
          </button>

          <div
            className="flex min-w-0 flex-1 flex-col"
            style={{ minWidth: 0 }}
          >
            <button
              type="button"
              onClick={() => setShowDetail(true)}
              className="min-w-0 text-left"
              style={{
                cursor: "pointer",
                background: "transparent",
                border: 0,
                padding: 0,
              }}
            >
              {primaryCategory ? (
                <span className="block truncate text-[10px] leading-tight text-neutral-400">
                  {categoryLabel(primaryCategory)}
                </span>
              ) : null}
              <h3 className="mt-0.5 text-sm font-semibold leading-snug text-white">
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
            </button>
            <div className="mt-auto" style={{ paddingTop: 8, display: "flex", gap: 8 }}>
              <AddToCartButton product={product} compact />
              <ProductWhatsAppCTA product={product} compact />
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowDetail(true)}
          aria-label={`Ver ${product.title}`}
          className="flex flex-1 flex-col text-left"
          style={{
            width: "100%",
            cursor: "pointer",
            background: "transparent",
            border: 0,
            padding: 0,
          }}
        >
          <div
            className="relative shrink-0"
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
            <span
              className="inline-flex items-center justify-center rounded-full bg-black/70 text-white"
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                width: 28,
                height: 28,
              }}
              aria-hidden="true"
            >
              <MaterialIcon name="visibility" className="text-sm" />
            </span>
          </div>

          <div
            className="flex flex-1 flex-col p-3"
            style={{ width: "100%", padding: 12 }}
          >
            {primaryCategory ? (
              <span className="block truncate text-[10px] leading-tight text-neutral-400">
                {categoryLabel(primaryCategory)}
              </span>
            ) : null}
            <h3 className="mt-1 line-clamp-2 text-xs font-semibold leading-snug text-white sm:text-sm">
              {product.title}
            </h3>
            {product.price != null ? (
              <p className="mt-1 text-xs font-semibold text-primary sm:text-sm">
                {formatProductPrice(product.price)}
              </p>
            ) : null}
          </div>
        </button>
      )}

      {isList ? null : (
        <div style={{ width: "100%", padding: "0 12px 12px", display: "flex", gap: 8 }}>
          <AddToCartButton product={product} compact />
          <ProductWhatsAppCTA product={product} compact />
        </div>
      )}

      {showDetail ? (
        <ProductDetailModal
          product={product}
          onClose={() => setShowDetail(false)}
        />
      ) : null}
    </article>
  );
}
