"use client";

import { MaterialIcon } from "@/components/ui/material-icon";
import { MoneyInput, moneyToNumber } from "@/components/ui/money-input";
import {
  formatDiscount,
  formatUnitPrice,
  normalizePackOptions,
  packPricing,
} from "../lib/packs";
import {
  newQuantityRow,
  type ProductFormState,
} from "../lib/product-form-state";
import { FieldError, fieldClassName } from "./product-form-ui";

type PackFieldsProps = {
  form: ProductFormState;
  onChange: (patch: Partial<ProductFormState>) => void;
  error?: string;
};

/**
 * Formatos de venta por pack (x10, x20, x30...). Cada fila lleva la cantidad y
 * el precio final del pack; se muestra el precio por unidad y el descuento
 * respecto del pack más chico.
 */
export function ProductPackFields({ form, onChange, error }: PackFieldsProps) {
  const rows = form.packOptions;
  const options =
    normalizePackOptions(
      rows.map((row) => ({
        quantity: Number(row.quantity),
        price: moneyToNumber(row.price),
      })),
    ) ?? [];
  const pricing = new Map(
    packPricing(options).map((option) => [option.quantity, option]),
  );
  const baseQuantity = options[0]?.quantity;

  return (
    <div className="flex flex-col gap-sm">
      <div>
        <p className="text-sm text-on-surface">Packs (venta mayorista)</p>
        <p className="text-xs text-on-surface-variant">
          Si cargás packs, el producto se vende solo por packs. El precio es el
          total del pack (ej: x10 a $12.000, x20 a $22.000). El descuento se
          calcula contra el pack más chico.
        </p>
      </div>
      {rows.map((row) => {
        const info = pricing.get(Number(row.quantity));
        return (
          <div
            key={row.id}
            className="grid gap-xs rounded-lg border border-outline-variant/20 p-sm"
          >
            <div className="grid gap-sm sm:grid-cols-[7rem_1fr_auto]">
              <label className="flex flex-col gap-xs">
                <span className="text-sm text-on-surface-variant">Cantidad</span>
                <input
                  inputMode="numeric"
                  value={row.quantity}
                  placeholder="10"
                  onChange={(event) => {
                    const quantity = event.target.value.replace(/\D/g, "");
                    onChange({
                      packOptions: rows.map((item) =>
                        item.id === row.id ? { ...item, quantity } : item,
                      ),
                    });
                  }}
                  className={fieldClassName}
                />
              </label>
              <label className="flex flex-col gap-xs">
                <span className="text-sm text-on-surface-variant">
                  Precio final del pack
                </span>
                <MoneyInput
                  value={row.price}
                  onChange={(value) =>
                    onChange({
                      packOptions: rows.map((item) =>
                        item.id === row.id ? { ...item, price: value } : item,
                      ),
                    })
                  }
                />
              </label>
              <button
                type="button"
                aria-label="Quitar pack"
                onClick={() =>
                  onChange({
                    packOptions: rows.filter((item) => item.id !== row.id),
                  })
                }
                className="inline-flex h-11 items-center justify-center self-end rounded-lg px-3 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              >
                <MaterialIcon name="delete" />
              </button>
            </div>
            {info ? (
              <p className="text-xs text-on-surface-variant">
                Precio por unidad:{" "}
                <span className="font-semibold text-on-surface">
                  {formatUnitPrice(info.unitPrice)}
                </span>
                {" · "}
                {info.quantity === baseQuantity ? (
                  "Pack base"
                ) : (
                  <>
                    Descuento aplicado:{" "}
                    <span className="font-semibold text-primary">
                      {formatDiscount(info.discountPercent)}
                    </span>
                  </>
                )}
              </p>
            ) : null}
          </div>
        );
      })}
      <FieldError message={error} />
      <button
        type="button"
        onClick={() => onChange({ packOptions: [...rows, newQuantityRow()] })}
        className="inline-flex w-fit items-center gap-1 rounded-lg px-2 py-2 text-sm text-primary hover:bg-primary/10"
      >
        <MaterialIcon name="add" className="text-base" />
        Agregar pack
      </button>
      <input
        type="hidden"
        name="packOptions"
        value={JSON.stringify(
          options.map((option) => ({
            quantity: option.quantity,
            price: option.price,
          })),
        )}
      />
    </div>
  );
}
