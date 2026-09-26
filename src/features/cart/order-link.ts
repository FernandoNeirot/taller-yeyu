import { absoluteUrl } from "@/lib/seo/site";
import type { CartItem } from "./types";

export type OrderDiscountType = "porcentaje" | "monto";

export type OrderSelectionLine = {
  slug: string;
  quantity: number;
  variant: string;
  notes: string;
  /** Total de la línea acordado por el taller. Si es null, se usa el precio del catálogo. */
  offer: number | null;
};

export type OrderSelection = {
  lines: OrderSelectionLine[];
  postalCode: string;
  locality: string;
  address: string;
  shipping: string;
  discountType: OrderDiscountType;
  discountValue: number;
};

const emptySelection: OrderSelection = {
  lines: [],
  postalCode: "",
  locality: "",
  address: "",
  shipping: "",
  discountType: "porcentaje",
  discountValue: 0,
};

export function buildOrderSelection(
  items: CartItem[],
  extra?: {
    postalCode?: string;
    locality?: string;
    address?: string;
    shipping?: string;
  },
): OrderSelection {
  return {
    lines: items
      .filter((item) => item.slug && item.quantity > 0)
      .map((item) => ({
        slug: item.slug,
        quantity: item.quantity,
        variant: item.variantDescription?.trim() ?? "",
        notes: item.customNotes.trim(),
        offer: null,
      })),
    postalCode: extra?.postalCode?.trim() ?? "",
    locality: extra?.locality?.trim() ?? "",
    address: extra?.address?.trim() ?? "",
    shipping: extra?.shipping?.trim() ?? "",
    discountType: "porcentaje",
    discountValue: 0,
  };
}

export function buildOrderSearchParams(selection: OrderSelection) {
  const params = new URLSearchParams();
  const hasOffer = selection.lines.some((line) => line.offer != null && line.offer > 0);

  for (const line of selection.lines) {
    params.append("producto", line.slug);
    params.append("cantidad", String(line.quantity));
    params.append("variante", line.variant);
    params.append("notas", line.notes);
    if (hasOffer) {
      params.append("oferta", line.offer != null && line.offer > 0 ? String(line.offer) : "");
    }
  }

  if (selection.postalCode) params.set("cp", selection.postalCode);
  if (selection.locality) params.set("localidad", selection.locality);
  if (selection.address) params.set("direccion", selection.address);
  if (selection.shipping) params.set("envio", selection.shipping);
  if (selection.discountValue > 0) {
    params.set("descuento", String(selection.discountValue));
    params.set("descuentoTipo", selection.discountType);
  }

  return params;
}

export function buildOrderPath(selection: OrderSelection) {
  const params = buildOrderSearchParams(selection);
  const query = params.toString();
  return query ? `/pedido?${query}` : "/pedido";
}

export function buildOrderUrl(selection: OrderSelection) {
  return absoluteUrl(buildOrderPath(selection));
}

function readValues(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
  key: string,
) {
  if (params instanceof URLSearchParams) return params.getAll(key);
  const value = params[key];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return [];
}

function readValue(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
  key: string,
) {
  return readValues(params, key)[0]?.trim() ?? "";
}

export function parseOrderSelection(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): OrderSelection {
  const slugs = readValues(params, "producto");
  const quantities = readValues(params, "cantidad");
  const variants = readValues(params, "variante");
  const notes = readValues(params, "notas");
  const offers = readValues(params, "oferta");
  const discountType = readValue(params, "descuentoTipo") === "monto" ? "monto" : "porcentaje";
  const discountValue = Math.max(0, Math.round(Number(readValue(params, "descuento")) || 0));

  const lines = slugs.flatMap((slug, index) => {
    const cleanSlug = slug.trim();
    const quantity = Math.floor(Number(quantities[index] ?? "1"));
    if (!cleanSlug || !Number.isFinite(quantity) || quantity < 1) return [];
    const offer = Math.round(Number(offers[index] ?? ""));
    return [
      {
        slug: cleanSlug,
        quantity,
        variant: (variants[index] ?? "").trim(),
        notes: (notes[index] ?? "").trim(),
        offer: Number.isFinite(offer) && offer > 0 ? offer : null,
      },
    ];
  });

  if (lines.length === 0) return emptySelection;

  return {
    lines,
    postalCode: readValue(params, "cp"),
    locality: readValue(params, "localidad"),
    address: readValue(params, "direccion"),
    shipping: readValue(params, "envio"),
    discountType,
    discountValue: discountType === "porcentaje" ? Math.min(100, discountValue) : discountValue,
  };
}
