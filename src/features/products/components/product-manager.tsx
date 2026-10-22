"use client";

import { useActionState, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import type { MaterialCatalogItem } from "@/features/quotes/types";
import type { Product } from "@/types/product";
import { deleteProductAction } from "../actions/delete-product";
import { saveProductAction } from "../actions/save-product";
import { toggleProductVisibilityAction } from "../actions/toggle-product-visibility";
import { useProductForm } from "../hooks/use-product-form";
import { formatProductPrice } from "../lib/format-price";
import { normalizeSearch, productId } from "../lib/product-form-state";
import { ProductDetailModal } from "./product-detail-modal";
import { fieldClassName } from "./product-form-ui";
import { ProductForm } from "./product-form";
import { CopyProductJsonExampleButton } from "./product-json-import";

type VisibilityFilter = "all" | "visible" | "hidden";

const visibilityFilters: { id: VisibilityFilter; label: string }[] = [
  { id: "all", label: "Mostrar todo" },
  { id: "visible", label: "Visibles" },
  { id: "hidden", label: "Ocultos" },
];

export function ProductManager({
  products: initialList,
  accessories = [],
}: {
  products: Product[];
  accessories?: MaterialCatalogItem[];
}) {
  const [products, setProducts] = useState(initialList);
  const [query, setQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilter>("all");
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const form = useProductForm({ accessories });
  const [state, action, pending] = useActionState(saveProductAction, null);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteProductAction,
    null,
  );
  const [visibilityState, visibilityAction, visibilityPending] = useActionState(
    toggleProductVisibilityAction,
    null,
  );
  const [prevState, setPrevState] = useState(state);
  const [prevDeleteState, setPrevDeleteState] = useState(deleteState);
  const [prevVisibilityState, setPrevVisibilityState] = useState(visibilityState);

  const visibilityCounts = useMemo(() => {
    const hidden = products.filter((product) => !product.isActive).length;
    return {
      all: products.length,
      visible: products.length - hidden,
      hidden,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const byVisibility = products.filter((product) => {
      if (visibilityFilter === "visible") return product.isActive;
      if (visibilityFilter === "hidden") return !product.isActive;
      return true;
    });
    const needle = normalizeSearch(query);
    if (!needle) return byVisibility;
    return byVisibility.filter((product) =>
      normalizeSearch(product.title).includes(needle),
    );
  }, [products, query, visibilityFilter]);

  // Reacciona a los resultados de los server actions (patrón "state derivado del render").
  if (state !== prevState) {
    setPrevState(state);
    const saved = state?.product;
    if (saved) {
      setProducts((prev) => {
        const id = productId(saved);
        const exists = prev.some((item) => productId(item) === id);
        const next = exists
          ? prev.map((item) => (productId(item) === id ? saved : item))
          : [...prev, saved];
        return [...next].sort((a, b) => a.title.localeCompare(b.title, "es"));
      });
      form.close();
    }
  }

  if (deleteState !== prevDeleteState) {
    setPrevDeleteState(deleteState);
    const deletedId = deleteState?.deletedId;
    if (deletedId) {
      setProducts((prev) => prev.filter((item) => productId(item) !== deletedId));
      if (form.editingId === deletedId) form.close();
      if (previewProduct && productId(previewProduct) === deletedId) {
        setPreviewProduct(null);
      }
    }
  }

  if (visibilityState !== prevVisibilityState) {
    setPrevVisibilityState(visibilityState);
    const updated = visibilityState?.product;
    if (updated) {
      setProducts((prev) =>
        prev.map((item) =>
          productId(item) === productId(updated) ? updated : item,
        ),
      );
      form.syncEditedProduct(updated);
      if (previewProduct && productId(previewProduct) === productId(updated)) {
        setPreviewProduct(updated);
      }
    }
  }

  return (
    <section>
      <article className="rounded-2xl border border-outline-variant/20 bg-surface-container p-lg">
        <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Productos ({products.length})
          </h3>
          <div className="flex flex-wrap items-center gap-sm">
            <CopyProductJsonExampleButton />
            <button
              type="button"
              onClick={() => {
                setPreviewProduct(null);
                form.startCreate();
              }}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary-container px-4 py-3 text-white font-label-caps text-label-caps tracking-widest uppercase hover:bg-secondary-container transition-colors"
            >
              <MaterialIcon
                name="add"
                className="text-base leading-none normal-case tracking-normal"
              />
              Nuevo producto
            </button>
          </div>
        </div>

        {deleteState?.error ? (
          <div className="mb-sm rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
            {deleteState.error}
          </div>
        ) : null}
        {visibilityState?.error ? (
          <div className="mb-sm rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
            {visibilityState.error}
          </div>
        ) : null}

        {products.length > 0 ? (
          <div className="mb-sm flex flex-col gap-sm" style={{ width: "100%" }}>
            <label className="flex flex-col gap-xs" style={{ width: "100%" }}>
              <span className="sr-only">Buscar producto</span>
              <div className="relative" style={{ position: "relative", width: "100%" }}>
                <span
                  className="pointer-events-none text-on-surface-variant"
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <MaterialIcon name="search" className="text-base" />
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por título..."
                  autoComplete="off"
                  className={fieldClassName}
                  style={{ width: "100%", paddingLeft: 40 }}
                />
              </div>
            </label>
            <div
              className="hide-scrollbar flex snap-x snap-mandatory items-center gap-2 overflow-x-auto"
              role="group"
              aria-label="Filtrar por visibilidad"
            >
              {visibilityFilters.map((item) => {
                const active = item.id === visibilityFilter;
                const count = visibilityCounts[item.id];

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setVisibilityFilter(item.id)}
                    aria-pressed={active}
                    className={
                      active
                        ? "touch-target snap-start shrink-0 whitespace-nowrap rounded-full bg-primary-container px-4 font-label-caps text-label-caps text-on-primary-container transition-colors"
                        : "touch-target snap-start shrink-0 whitespace-nowrap rounded-full border border-outline-variant bg-surface-container px-4 font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-container-high transition-colors"
                    }
                  >
                    {item.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {products.length === 0 ? (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-lg text-center text-on-surface-variant">
            Todavía no hay productos cargados.
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-lg text-center text-on-surface-variant">
            {query.trim()
              ? visibilityFilter === "hidden"
                ? `No hay productos ocultos que coincidan con “${query.trim()}”.`
                : visibilityFilter === "visible"
                  ? `No hay productos visibles que coincidan con “${query.trim()}”.`
                  : `No hay productos que coincidan con “${query.trim()}”.`
              : visibilityFilter === "hidden"
                ? "No hay productos ocultos."
                : visibilityFilter === "visible"
                  ? "No hay productos visibles."
                  : "No hay productos para mostrar."}
          </div>
        ) : (
          <div className="flex flex-col gap-sm">
            {query.trim() || visibilityFilter !== "all" ? (
              <p className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">
                {filteredProducts.length === 1
                  ? "1 coincidencia"
                  : `${filteredProducts.length} coincidencias`}
              </p>
            ) : null}
            {filteredProducts.map((product) => {
              const id = productId(product);
              const hidden = !product.isActive;

              return (
                <div
                  key={id}
                  className={
                    id === form.editingId && form.isOpen
                      ? "rounded-xl border border-primary/40 bg-primary/10 p-sm"
                      : "rounded-xl border border-outline-variant/20 bg-surface-container-low p-sm"
                  }
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    width: "100%",
                  }}
                >
                  <div style={{ width: "100%" }}>
                    <p
                      className="font-headline-md text-on-surface"
                      style={{ overflowWrap: "anywhere" }}
                    >
                      {product.title}
                    </p>
                    {hidden ? (
                      <p className="mt-1 text-sm text-secondary">
                        Oculto en galería
                      </p>
                    ) : null}
                    {product.variants?.length ? (
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {product.variants
                          .map(
                            (option) =>
                              `${option.description} ${formatProductPrice(option.price)}`,
                          )
                          .join(" · ")}
                      </p>
                    ) : null}
                    {product.packOptions?.length ? (
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {product.packOptions
                          .map(
                            (option) =>
                              `Pack x${option.quantity} ${formatProductPrice(option.price)}`,
                          )
                          .join(" · ")}
                      </p>
                    ) : null}
                    {product.quantityPrices?.length ? (
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {product.quantityPrices
                          .map(
                            (tier) =>
                              `${tier.quantity} a ${formatProductPrice(tier.price)}`,
                          )
                          .join(" · ")}
                      </p>
                    ) : null}
                    {product.costQuote?.totalAmount ? (
                      <p className="mt-1 text-sm text-on-surface-variant">
                        Costo {formatProductPrice(product.costQuote.totalAmount)}
                      </p>
                    ) : null}
                  </div>
                  <div
                    className="flex flex-wrap items-center gap-xs"
                    style={{ width: "100%" }}
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewProduct(product)}
                      className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-primary hover:bg-primary/10"
                      aria-label={`Ver ${product.title}`}
                      title="Ver datos"
                    >
                      <MaterialIcon name="visibility" className="text-base" />
                      <span className="font-label-caps text-label-caps tracking-widest">
                        Ver
                      </span>
                    </button>
                    <form action={visibilityAction}>
                      <input type="hidden" name="id" value={id} />
                      <input
                        type="hidden"
                        name="isActive"
                        value={hidden ? "true" : "false"}
                      />
                      <button
                        type="submit"
                        disabled={visibilityPending}
                        className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-primary hover:bg-primary/10 disabled:opacity-50"
                        aria-label={
                          hidden
                            ? `Publicar ${product.title} en la galería`
                            : `Ocultar ${product.title} de la galería`
                        }
                        title={
                          hidden
                            ? "Publicar en galería"
                            : "Ocultar de la galería"
                        }
                      >
                        <MaterialIcon
                          name={hidden ? "publish" : "unpublished"}
                          className="text-base"
                        />
                        <span className="font-label-caps text-label-caps tracking-widest">
                          {hidden ? "Publicar" : "Ocultar"}
                        </span>
                      </button>
                    </form>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewProduct(null);
                        form.startEdit(product);
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-primary hover:bg-primary/10"
                      aria-label={`Editar ${product.title}`}
                      title="Editar"
                    >
                      <MaterialIcon name="edit" className="text-base" />
                    </button>
                    <form
                      action={deleteAction}
                      onSubmit={(event) => {
                        if (
                          !window.confirm(
                            `¿Eliminar "${product.title}"? Esta acción no se puede deshacer.`,
                          )
                        ) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <input type="hidden" name="id" value={id} />
                      <button
                        type="submit"
                        disabled={deletePending}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-error hover:bg-error/10 disabled:opacity-50"
                        aria-label={`Eliminar ${product.title}`}
                        title="Eliminar"
                      >
                        <MaterialIcon name="delete" className="text-base" />
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </article>

      <ProductForm
        controller={form}
        accessories={accessories}
        action={action}
        pending={pending}
        serverError={state?.error}
      />

      {previewProduct ? (
        <ProductDetailModal
          product={previewProduct}
          showInquiry={false}
          showAddToCart={false}
          onClose={() => setPreviewProduct(null)}
        />
      ) : null}
    </section>
  );
}
