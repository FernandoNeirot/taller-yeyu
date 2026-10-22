"use client";

import { MaterialIcon } from "@/components/ui/material-icon";
import { MoneyInput, moneyToNumber } from "@/components/ui/money-input";
import { normalizeQuantityPrices } from "../lib/quantity-prices";
import { normalizeVariants } from "../lib/variants";
import {
  newQuantityRow,
  newVariantRow,
  type ProductFormState,
} from "../lib/product-form-state";
import { FieldError, fieldClassName } from "./product-form-ui";

type PricingFieldsProps = {
  form: ProductFormState;
  onChange: (patch: Partial<ProductFormState>) => void;
  errors: { quantityPrices?: string; variants?: string };
};

const removeButtonClassName =
  "inline-flex h-11 items-center justify-center self-end rounded-lg px-3 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface";
const addButtonClassName =
  "inline-flex w-fit items-center gap-1 rounded-lg px-2 py-2 text-sm text-primary hover:bg-primary/10";

/** Precios por cantidad y variantes (se envían como JSON en inputs ocultos). */
export function ProductPricingFields({
  form,
  onChange,
  errors,
}: PricingFieldsProps) {
  const { quantityPrices, variants } = form;

  return (
    <>
      <div className="flex flex-col gap-sm">
        <div>
          <p className="text-sm text-on-surface">Precios por cantidad</p>
          <p className="text-xs text-on-surface-variant">
            El precio es el total de esa cantidad. Por ejemplo, 4 a $8.000, 8 a
            $14.000 y 12 a $18.000.
          </p>
        </div>
        {quantityPrices.map((row) => (
          <div
            key={row.id}
            className="grid gap-sm sm:grid-cols-[7rem_1fr_auto]"
          >
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">Cantidad</span>
              <input
                inputMode="numeric"
                value={row.quantity}
                onChange={(event) => {
                  const quantity = event.target.value.replace(/\D/g, "");
                  onChange({
                    quantityPrices: quantityPrices.map((item) =>
                      item.id === row.id ? { ...item, quantity } : item,
                    ),
                  });
                }}
                className={fieldClassName}
              />
            </label>
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">Precio</span>
              <MoneyInput
                value={row.price}
                onChange={(value) =>
                  onChange({
                    quantityPrices: quantityPrices.map((item) =>
                      item.id === row.id ? { ...item, price: value } : item,
                    ),
                  })
                }
              />
            </label>
            <button
              type="button"
              aria-label="Quitar cantidad"
              onClick={() =>
                onChange({
                  quantityPrices: quantityPrices.filter(
                    (item) => item.id !== row.id,
                  ),
                })
              }
              className={removeButtonClassName}
            >
              <MaterialIcon name="delete" />
            </button>
          </div>
        ))}
        <FieldError message={errors.quantityPrices} />
        <button
          type="button"
          onClick={() =>
            onChange({ quantityPrices: [...quantityPrices, newQuantityRow()] })
          }
          className={addButtonClassName}
        >
          <MaterialIcon name="add" className="text-base" />
          Agregar cantidad
        </button>
        <input
          type="hidden"
          name="quantityPrices"
          value={JSON.stringify(
            normalizeQuantityPrices(
              quantityPrices.map((row) => ({
                quantity: Number(row.quantity),
                price: moneyToNumber(row.price),
              })),
            ) ?? [],
          )}
        />
      </div>

      <div className="flex flex-col gap-sm">
        <div>
          <p className="text-sm text-on-surface">Variantes</p>
          <p className="text-xs text-on-surface-variant">
            Cada opción lleva una descripción y su precio. Por ejemplo, Pintado
            y Sin pintar. Si también hay un precio por cantidad, al elegir esa
            cantidad se usa ese total.
          </p>
        </div>
        {variants.map((row) => (
          <div
            key={row.id}
            className="grid gap-sm sm:grid-cols-[1fr_11rem_auto]"
          >
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">
                Descripción
              </span>
              <input
                value={row.description}
                onChange={(event) =>
                  onChange({
                    variants: variants.map((item) =>
                      item.id === row.id
                        ? { ...item, description: event.target.value }
                        : item,
                    ),
                  })
                }
                className={fieldClassName}
              />
            </label>
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">Precio</span>
              <MoneyInput
                value={row.price}
                onChange={(value) =>
                  onChange({
                    variants: variants.map((item) =>
                      item.id === row.id ? { ...item, price: value } : item,
                    ),
                  })
                }
              />
            </label>
            <button
              type="button"
              aria-label="Quitar variante"
              onClick={() =>
                onChange({
                  variants: variants.filter((item) => item.id !== row.id),
                })
              }
              className={removeButtonClassName}
            >
              <MaterialIcon name="delete" />
            </button>
          </div>
        ))}
        <FieldError message={errors.variants} />
        <button
          type="button"
          onClick={() => onChange({ variants: [...variants, newVariantRow()] })}
          className={addButtonClassName}
        >
          <MaterialIcon name="add" className="text-base" />
          Agregar variante
        </button>
        <input
          type="hidden"
          name="variants"
          value={JSON.stringify(
            normalizeVariants(
              variants.map((row) => ({
                description: row.description,
                price: moneyToNumber(row.price),
              })),
            ) ?? [],
          )}
        />
      </div>
    </>
  );
}
