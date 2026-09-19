"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import type { Product } from "@/types/product";
import { productGalleryImages } from "../lib/gallery-images";

export function ProductGallery({ product }: { product: Product }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const images = productGalleryImages(product);
  const hasMany = images.length > 1;

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

  function handleScroll() {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.clientWidth === 0) return;
    const next = Math.round(scroller.scrollLeft / scroller.clientWidth);
    setIndex(Math.min(Math.max(next, 0), images.length - 1));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest">
      <div
        className="relative bg-surface-container-lowest"
        style={{ width: "100%", aspectRatio: "1 / 1" }}
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
                sizes="(min-width: 1024px) 50vw, 100vw"
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
          style={{ overflowX: "auto", width: "100%" }}
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
                style={{ flex: "0 0 64px", width: 64, height: 64 }}
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
    </div>
  );
}
