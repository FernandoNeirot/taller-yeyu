"use client";

import Image from "next/image";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useCart } from "@/context/CartContext";
import { formatProductPrice } from "@/features/products/lib/format-price";
import { formatProductDimensions } from "@/features/products/lib/measures";
import { QuantityPricePicker } from "@/features/products/components/quantity-price-picker";
import { VariantPricePicker } from "@/features/products/components/variant-price-picker";
import {
  hasQuantityOffers,
  offerTiers,
  priceForQuantity,
  purchaseOptions,
} from "@/features/products/lib/quantity-prices";
import {
  hasPackOptions,
  packOptionLabel,
  packPricing,
  packSavingsText,
} from "@/features/products/lib/packs";
import { hasVariants, normalizeVariants } from "@/features/products/lib/variants";
import type { Product } from "@/types/product";

type AddToCartModalProps = {
  product: Product | null;
  initialQuantity?: number;
  initialVariantDescription?: string;
  onClose: () => void;
};

function subscribeToNothing() {
  return () => {};
}

function subscribeDesktop(onStoreChange: () => void) {
  const media = window.matchMedia("(min-width: 768px)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

export function AddToCartModal({
  product,
  initialQuantity = 1,
  initialVariantDescription,
  onClose,
}: AddToCartModalProps) {
  const titleId = useId();
  const { addToCart, openCart, showToast } = useCart();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [customNotes, setCustomNotes] = useState("");
  const [variantDescription, setVariantDescription] = useState(
    initialVariantDescription ?? "",
  );
  const selectionKey = `${product?.slug ?? ""}:${initialQuantity}:${initialVariantDescription ?? ""}`;
  const [formKey, setFormKey] = useState(selectionKey);
  const mounted = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false,
  );

  if (product && formKey !== selectionKey) {
    setFormKey(selectionKey);
    setQuantity(initialQuantity);
    setVariantDescription(initialVariantDescription ?? "");
    setCustomNotes("");
  }

  useEffect(() => {
    if (!product) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [product]);

  useEffect(() => {
    if (!product) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, product]);

  if (!mounted || !product) return null;

  const selected = product;
  const options = purchaseOptions(selected);
  const showQuantityOffers = hasQuantityOffers(selected);
  const variants = normalizeVariants(selected.variants) ?? [];
  const showVariants = hasVariants(selected);
  const selectedOffer =
    priceForQuantity(options, quantity) ?? options[0] ?? null;
  const selectedVariant =
    variants.find((option) => option.description === variantDescription) ??
    variants[0] ??
    null;
  const quantityTier = offerTiers(selected).find(
    (tier) => tier.quantity === (selectedOffer?.quantity ?? quantity),
  );
  const chosenQuantity = selectedOffer?.quantity ?? quantity;
  const isPack = hasPackOptions(selected);
  const packInfo = isPack
    ? packPricing(options).find((option) => option.quantity === chosenQuantity)
    : undefined;
  const shownPrice = quantityTier
    ? quantityTier.price
    : selectedVariant
      ? selectedVariant.price * Math.max(1, chosenQuantity)
      : selected.price != null
        ? selected.price * Math.max(1, chosenQuantity)
        : null;

  function addProduct() {
    addToCart(selected, chosenQuantity, customNotes, {
      variant: selectedVariant ?? undefined,
    });
  }

  function keepShopping() {
    addProduct();
    showToast("¡Agregado al carrito!");
    onClose();
  }

  function goToCart() {
    addProduct();
    onClose();
    openCart();
  }

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483646,
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
          cursor: "pointer",
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-surface-container-lowest text-on-surface shadow-2xl shadow-stone-900/20"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: isDesktop ? 440 : "100%",
          maxHeight: isDesktop ? "min(86dvh, 640px)" : "min(88dvh, 720px)",
          overflowY: "auto",
          borderRadius: isDesktop ? 20 : "20px 20px 0 0",
          padding: 20,
        }}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-outline-variant md:hidden" />
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold leading-tight">
            Agregar al carrito
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full text-on-surface-variant hover:bg-on-surface/10 hover:text-on-surface"
            style={{ minHeight: 40, minWidth: 40, flexShrink: 0 }}
          >
            <MaterialIcon name="close" />
          </button>
        </div>

        <div className="mt-4 flex gap-3" style={{ minWidth: 0 }}>
          <div
            className="relative overflow-hidden rounded-xl bg-surface-container"
            style={{ width: 88, height: 88, flexShrink: 0 }}
          >
            <Image
              alt=""
              src={product.featuredImage}
              fill
              className="object-cover"
              sizes="88px"
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <p className="line-clamp-2 text-sm font-semibold">{product.title}</p>
            {formatProductDimensions(product) ? (
              <p className="mt-1 text-xs text-on-surface-variant">
                {formatProductDimensions(product)}
              </p>
            ) : null}
            {isPack ? (
              <p className="mt-1 text-xs font-semibold text-on-surface">
                Formato: {packOptionLabel(chosenQuantity)}
              </p>
            ) : null}
            {shownPrice != null ? (
              <p className="mt-1 text-sm font-semibold text-orange-200">
                {formatProductPrice(shownPrice)}
                {isPack
                  ? ""
                  : quantityTier && quantityTier.quantity > 1
                    ? ` por ${quantityTier.quantity}`
                    : selectedVariant
                      ? ` · ${selectedVariant.description}`
                      : chosenQuantity > 1
                        ? ` por ${chosenQuantity}`
                        : ""}
              </p>
            ) : (
              <p className="mt-1 text-xs text-on-surface-variant">Precio a cotizar</p>
            )}
            {packInfo ? (
              <p className="mt-0.5 text-xs font-semibold text-primary">
                {packSavingsText(packInfo)}
              </p>
            ) : null}
          </div>
        </div>

        {showVariants ? (
          <VariantPricePicker
            options={variants}
            description={selectedVariant?.description ?? ""}
            onChange={setVariantDescription}
            tone="modal"
          />
        ) : null}
        {showQuantityOffers ? (
          <QuantityPricePicker
            options={options}
            quantity={selectedOffer?.quantity ?? quantity}
            onChange={setQuantity}
            variant="modal"
            packs={isPack}
          />
        ) : (
          <div className="mt-5">
            <p className="text-xs font-semibold tracking-widest text-on-surface-variant uppercase">
              Cantidad
            </p>
            <div
              className="mt-2 inline-flex items-center rounded-xl bg-surface-container-high"
              style={{ height: 44 }}
            >
              <button
                type="button"
                aria-label="Quitar una unidad"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                style={{ minWidth: 44, minHeight: 44 }}
              >
                <MaterialIcon name="remove" />
              </button>
              <span className="min-w-10 text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Agregar una unidad"
                onClick={() => setQuantity((value) => value + 1)}
                style={{ minWidth: 44, minHeight: 44 }}
              >
                <MaterialIcon name="add" />
              </button>
            </div>
          </div>
        )}

        {product.specifications.customizable ? (
          <label className="mt-4 block">
            <span className="text-xs font-semibold tracking-widest text-on-surface-variant uppercase">
              Personalización
            </span>
            <textarea
              value={customNotes}
              onChange={(event) => setCustomNotes(event.target.value)}
              placeholder="Nombre, fecha, temática u otros detalles"
              className="mt-2 rounded-xl border border-outline-variant bg-surface-container-high px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
              style={{ width: "100%", minHeight: 88 }}
            />
          </label>
        ) : null}

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={goToCart}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500"
            style={{ minHeight: 48, width: "100%" }}
          >
            <MaterialIcon name="shopping_bag" />
            Ir al carrito
          </button>
          <button
            type="button"
            onClick={keepShopping}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface-container-high text-sm font-semibold text-on-surface hover:bg-surface-container-highest"
            style={{ minHeight: 48, width: "100%" }}
          >
            Seguir comprando
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
