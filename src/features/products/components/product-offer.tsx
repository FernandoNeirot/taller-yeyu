"use client";

import { useState, type ReactNode } from "react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import type { Product } from "@/types/product";
import { formatProductPrice } from "../lib/format-price";
import {
  hasPackOptions,
  packOptionLabel,
  packPricing,
  packSavingsText,
} from "../lib/packs";
import {
  hasQuantityOffers,
  offerTiers,
  priceForQuantity,
  purchaseOptions,
} from "../lib/quantity-prices";
import { hasVariants, normalizeVariants } from "../lib/variants";
import { ProductWhatsAppCTA } from "./product-whatsapp-cta";
import { QuantityPricePicker } from "./quantity-price-picker";
import { VariantPricePicker } from "./variant-price-picker";

export function ProductOffer({
  product,
  children,
}: {
  product: Product;
  children: ReactNode;
}) {
  const options = purchaseOptions(product);
  const showQuantityPicker = hasQuantityOffers(product);
  const variants = normalizeVariants(product.variants) ?? [];
  const showVariants = hasVariants(product);
  const [quantity, setQuantity] = useState(options[0]?.quantity ?? 1);
  const [customizationText, setCustomizationText] = useState("");
  const [variantDescription, setVariantDescription] = useState(
    variants[0]?.description ?? "",
  );
  const selectedQuantity =
    priceForQuantity(options, quantity) ?? options[0] ?? null;
  const selectedVariant =
    variants.find((option) => option.description === variantDescription) ??
    variants[0] ??
    null;
  const quantityTier = offerTiers(product).find(
    (tier) => tier.quantity === (selectedQuantity?.quantity ?? quantity),
  );
  const isPack = hasPackOptions(product);
  const pack = isPack
    ? packPricing(options).find(
        (option) => option.quantity === (selectedQuantity?.quantity ?? quantity),
      )
    : undefined;
  const shownPrice = quantityTier
    ? quantityTier.price
    : selectedVariant
      ? selectedVariant.price
      : (selectedQuantity?.price ?? product.price ?? null);

  return (
    <>
      {shownPrice != null ? (
        <div className="mt-3">
          <p className="font-headline-md text-headline-md text-primary">
            {formatProductPrice(shownPrice)}
          </p>
          {pack ? (
            <>
              <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                {packOptionLabel(pack.quantity)}
              </p>
              <p className="mt-0.5 font-body-md text-body-md font-semibold text-primary">
                {packSavingsText(pack)}
              </p>
            </>
          ) : quantityTier && quantityTier.quantity > 1 ? (
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              {selectedVariant ? `${selectedVariant.description} · ` : ""}
              por {quantityTier.quantity} unidades
              {` · ${formatProductPrice(quantityTier.price / quantityTier.quantity)} c/u`}
            </p>
          ) : selectedVariant ? (
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              {selectedVariant.description}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 font-body-md text-body-md text-on-surface-variant">
          Precio a cotizar
        </p>
      )}

      {showVariants ? (
        <VariantPricePicker
          options={variants}
          description={selectedVariant?.description ?? ""}
          onChange={setVariantDescription}
        />
      ) : null}

      {showQuantityPicker ? (
        <QuantityPricePicker
          options={options}
          quantity={selectedQuantity?.quantity ?? quantity}
          onChange={setQuantity}
          packs={isPack}
        />
      ) : null}

      {children}

      {product.specifications.customizable ? (
        <label className="mt-6 block">
          <span className="font-label-caps text-label-caps tracking-widest text-on-surface-variant uppercase">
            Dejanos el nombre, número o detalle para personalizar
          </span>
          <input
            type="text"
            value={customizationText}
            maxLength={120}
            autoComplete="off"
            placeholder="Ej: Mateo, número 10"
            onChange={(event) => setCustomizationText(event.target.value)}
            className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-surface-container px-4 py-3 text-on-surface outline-none focus:border-primary"
          />
        </label>
      ) : null}

      <div className="mt-6 flex flex-col gap-2">
        <AddToCartButton
          product={product}
          initialCustomNotes={customizationText.trim()}
          initialQuantity={selectedQuantity?.quantity ?? 1}
          initialVariantDescription={selectedVariant?.description}
        />
        <ProductWhatsAppCTA product={product} />
      </div>
    </>
  );
}
