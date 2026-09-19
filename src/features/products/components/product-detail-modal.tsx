"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { categoryLabel } from "@/types/product";
import type { Product } from "@/types/product";
import { formatProductPrice } from "../lib/format-price";
import { productGalleryImages } from "../lib/gallery-images";
import { productMeasureRows } from "../lib/measures";
import { ProductWhatsAppCTA } from "./product-whatsapp-cta";

type ProductDetailModalProps = {
  product: Product;
  onClose: () => void;
  showInquiry?: boolean;
  showAddToCart?: boolean;
};

export function ProductDetailModal({
  product,
  onClose,
  showInquiry = true,
  showAddToCart = true,
}: ProductDetailModalProps) {
  const titleId = useId();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [entered, setEntered] = useState(false);
  const images = productGalleryImages(product);
  const hasMany = images.length > 1;
  const primaryCategory = product.categories[0];

  const goTo = useCallback(
    (next: number) => {
      if (images.length < 2) return;
      const bounded = (next + images.length) % images.length;
      const scroller = scrollerRef.current;
      setIndex(bounded);
      if (!scroller) return;
      scroller.scrollTo({
        left: bounded * scroller.clientWidth,
        behavior: "smooth",
      });
    },
    [images.length],
  );

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(media.matches);
    sync();
    setMounted(true);
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [mounted]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(index + 1);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(index - 1);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, index, onClose]);

  function handleScroll() {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.clientWidth === 0) return;
    const next = Math.round(scroller.scrollLeft / scroller.clientWidth);
    setIndex(Math.min(Math.max(next, 0), images.length - 1));
  }

  if (!mounted) return null;

  return createPortal(
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        display: "flex",
        alignItems: isDesktop ? "center" : "flex-end",
        justifyContent: "center",
        padding: isDesktop ? 24 : 0,
      }}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          border: 0,
          background: "rgba(0,0,0,0.55)",
          opacity: entered ? 1 : 0,
          transition: "opacity 220ms ease",
          cursor: "pointer",
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-surface"
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: isDesktop ? 1000 : "100%",
          maxHeight: "90dvh",
          overflow: "hidden",
          borderRadius: isDesktop ? 20 : "20px 20px 0 0",
          transform: isDesktop
            ? entered
              ? "translateY(0)"
              : "translateY(16px)"
            : entered
              ? "translateY(0)"
              : "translateY(100%)",
          opacity: isDesktop ? (entered ? 1 : 0) : 1,
          transition: isDesktop
            ? "transform 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease"
            : "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {!isDesktop ? (
          <div
            aria-hidden="true"
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: 10,
              flexShrink: 0,
            }}
          >
            <span
              className="bg-outline-variant"
              style={{
                width: 40,
                height: 4,
                borderRadius: 999,
                display: "block",
              }}
            />
          </div>
        ) : null}

        <header
          className="flex items-center justify-between gap-sm border-b border-outline-variant/30 bg-surface-container"
          style={{
            flexShrink: 0,
            padding: "8px 12px",
            minHeight: 56,
          }}
        >
          <h2
            id={titleId}
            className="min-w-0 truncate font-headline-md text-headline-md text-on-surface"
          >
            {product.title}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="touch-target inline-flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
            style={{ minHeight: 44, minWidth: 44, flexShrink: 0 }}
          >
            <MaterialIcon name="close" />
          </button>
        </header>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowX: "hidden",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div
            className="relative bg-surface-container-lowest"
            style={{
              width: "100%",
              height: isDesktop ? "min(48dvh, 460px)" : "min(38dvh, 280px)",
            }}
          >
            <div
              ref={scrollerRef}
              onScroll={handleScroll}
              className="hide-scrollbar"
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
                overflowX: "auto",
                overflowY: "hidden",
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {images.map((src, imageIndex) => (
                <div
                  key={`${src}-${imageIndex}`}
                  style={{
                    position: "relative",
                    flex: "0 0 100%",
                    width: "100%",
                    height: "100%",
                    scrollSnapAlign: "start",
                    scrollSnapStop: "always",
                  }}
                >
                  <Image
                    alt={`${product.title} — foto ${imageIndex + 1}`}
                    src={src}
                    fill
                    priority={imageIndex === 0}
                    className="object-contain"
                    sizes={isDesktop ? "1000px" : "100vw"}
                    unoptimized
                  />
                </div>
              ))}
            </div>

            {hasMany ? (
              <>
                <button
                  type="button"
                  aria-label="Foto anterior"
                  onClick={() => goTo(index - 1)}
                  className="touch-target inline-flex items-center justify-center rounded-full bg-surface-container/90 text-on-surface"
                  style={{
                    position: "absolute",
                    left: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    minHeight: 44,
                    minWidth: 44,
                    zIndex: 2,
                  }}
                >
                  <MaterialIcon name="chevron_left" />
                </button>
                <button
                  type="button"
                  aria-label="Foto siguiente"
                  onClick={() => goTo(index + 1)}
                  className="touch-target inline-flex items-center justify-center rounded-full bg-surface-container/90 text-on-surface"
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    minHeight: 44,
                    minWidth: 44,
                    zIndex: 2,
                  }}
                >
                  <MaterialIcon name="chevron_right" />
                </button>
                <p
                  className="rounded-full bg-surface-container/90 px-3 py-1 font-label-caps text-label-caps tracking-widest text-on-surface"
                  style={{
                    position: "absolute",
                    right: 12,
                    bottom: 12,
                    zIndex: 2,
                  }}
                >
                  {index + 1} / {images.length}
                </p>
              </>
            ) : null}
          </div>

          {hasMany ? (
            <div
              className="hide-scrollbar flex gap-sm bg-surface-container-low px-3 py-2"
              style={{
                overflowX: "auto",
                width: "100%",
              }}
            >
              {images.map((src, imageIndex) => {
                const selected = imageIndex === index;
                return (
                  <button
                    key={`thumb-${src}-${imageIndex}`}
                    type="button"
                    aria-label={`Ver foto ${imageIndex + 1}`}
                    aria-current={selected ? true : undefined}
                    onClick={() => goTo(imageIndex)}
                    className={
                      selected
                        ? "relative overflow-hidden rounded-lg border-2 border-primary"
                        : "relative overflow-hidden rounded-lg border border-outline-variant/40"
                    }
                    style={{
                      flex: "0 0 64px",
                      width: 64,
                      height: 64,
                    }}
                  >
                    <Image
                      alt=""
                      src={src}
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized
                    />
                  </button>
                );
              })}
            </div>
          ) : null}

          <div
            className="bg-surface-container-high"
            style={{
              padding: 16,
              width: "100%",
            }}
          >
            {primaryCategory ? (
              <span className="rounded-full bg-surface-container px-2 py-0.5 font-label-caps text-label-caps text-secondary tracking-widest">
                {categoryLabel(primaryCategory)}
              </span>
            ) : null}

            {product.price != null ? (
              <p className="mt-2 font-headline-md text-headline-md text-primary">
                {formatProductPrice(product.price)}
              </p>
            ) : null}

            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
              {product.fullDescription || product.shortDescription}
            </p>

            <dl className="mt-4 space-y-1 font-body-md text-body-md text-on-surface-variant">
              {productMeasureRows(product).map((row) => (
                <div key={row.label}>
                  <dt className="inline font-label-caps text-label-caps text-secondary tracking-widest">
                    {row.label}:{" "}
                  </dt>
                  <dd className="inline">{row.value}</dd>
                </div>
              ))}
              {product.specifications.finish ? (
                <div>
                  <dt className="inline font-label-caps text-label-caps text-secondary tracking-widest">
                    Acabado:{" "}
                  </dt>
                  <dd className="inline">{product.specifications.finish}</dd>
                </div>
              ) : null}
            </dl>

            {showAddToCart ? (
              <div className="mt-4" style={{ paddingBottom: 8 }}>
                <AddToCartButton product={product} />
              </div>
            ) : null}

            {showInquiry ? (
              <div className="mt-2" style={{ paddingBottom: 8 }}>
                <ProductWhatsAppCTA product={product} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
