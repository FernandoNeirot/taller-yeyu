"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MaterialIcon } from "@/components/ui/material-icon";
import { MoneyInput } from "@/components/ui/money-input";
import {
  catalogCategories,
  categoryLabel,
  topicLabel,
  type Product,
} from "@/types/product";
import { deleteProductAction } from "../actions/delete-product";
import { saveProductAction } from "../actions/save-product";
import { toggleProductVisibilityAction } from "../actions/toggle-product-visibility";
import { formatProductPrice } from "../lib/format-price";
import {
  MAX_PRODUCT_IMAGES,
  compressImageToWebp,
  fileToBase64,
} from "../utils/compress-image";

type FormState = {
  title: string;
  shortDescription: string;
  fullDescription: string;
  categories: string[];
  topics: string;
  dimensions: string;
  finish: string;
  customizable: boolean;
  hidden: boolean;
  price: string;
};

const emptyForm: FormState = {
  title: "",
  shortDescription: "",
  fullDescription: "",
  categories: [],
  topics: "",
  dimensions: "",
  finish: "",
  customizable: true,
  hidden: false,
  price: "",
};

const fieldClassName =
  "w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary";

function productId(product: Product) {
  return product.id ?? product.slug;
}

function productToForm(product: Product): FormState {
  return {
    title: product.title,
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    categories: product.categories,
    topics: product.topics.map(topicLabel).join(", "),
    dimensions: product.specifications.dimensions,
    finish: product.specifications.finish,
    customizable: product.specifications.customizable,
    hidden: !product.isActive,
    price: product.price == null ? "" : String(product.price),
  };
}

export function ProductManager({
  products: initialList,
}: {
  products: Product[];
}) {
  const [products, setProducts] = useState(initialList);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<{ preview: string; base64: string }[]>(
    [],
  );
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const remainingSlots = MAX_PRODUCT_IMAGES - existingImages.length - newFiles.length;

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
      setForm(emptyForm);
      setEditingId(null);
      setExistingImages([]);
      setNewFiles((current) => {
        current.forEach((file) => URL.revokeObjectURL(file.preview));
        return [];
      });
      setImageError("");
    }
  }

  if (deleteState !== prevDeleteState) {
    setPrevDeleteState(deleteState);
    const deletedId = deleteState?.deletedId;
    if (deletedId) {
      setProducts((prev) => prev.filter((item) => productId(item) !== deletedId));
      if (editingId === deletedId) {
        setForm(emptyForm);
        setEditingId(null);
        setExistingImages([]);
        setNewFiles((current) => {
          current.forEach((file) => URL.revokeObjectURL(file.preview));
          return [];
        });
        setImageError("");
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
      if (editingId === productId(updated)) {
        setForm(productToForm(updated));
      }
    }
  }

  useEffect(() => {
    return () => {
      newFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [newFiles]);

  function resetFormFields() {
    setForm(emptyForm);
    setEditingId(null);
    setExistingImages([]);
    setNewFiles((current) => {
      current.forEach((file) => URL.revokeObjectURL(file.preview));
      return [];
    });
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function resetForm() {
    resetFormFields();
  }

  function startEdit(product: Product) {
    setForm(productToForm(product));
    setEditingId(productId(product));
    setExistingImages(product.galleryImages.slice(0, MAX_PRODUCT_IMAGES));
    setNewFiles((current) => {
      current.forEach((file) => URL.revokeObjectURL(file.preview));
      return [];
    });
    setImageError("");
  }

  function toggleCategory(categoryId: string) {
    setForm((current) => ({
      ...current,
      categories: current.categories.includes(categoryId)
        ? current.categories.filter((item) => item !== categoryId)
        : [...current.categories, categoryId],
    }));
  }

  async function onSelectImages(files: FileList | null) {
    if (!files?.length) return;

    const incoming = Array.from(files).slice(0, remainingSlots);
    try {
      const compressed = await Promise.all(incoming.map(compressImageToWebp));
      const next = await Promise.all(
        compressed.map(async (file) => ({
          preview: URL.createObjectURL(file),
          base64: await fileToBase64(file),
        })),
      );
      setNewFiles((prev) => [...prev, ...next]);
      setImageError("");
    } catch (error) {
      setImageError(
        error instanceof Error
          ? error.message
          : "No se pudieron optimizar las imágenes.",
      );
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeExisting(index: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNew(index: number) {
    setNewFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-lg">
      <article className="rounded-2xl border border-outline-variant/20 bg-surface-container p-lg">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">
          {editingId ? "Editar producto" : "Crear producto"}
        </h2>

        <form action={action} className="flex flex-col gap-sm">
          {state?.error ? (
            <div className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
              {state.error}
            </div>
          ) : null}
          {deleteState?.error ? (
            <div className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
              {deleteState.error}
            </div>
          ) : null}
          {visibilityState?.error ? (
            <div className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
              {visibilityState.error}
            </div>
          ) : null}
          {imageError ? (
            <div className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
              {imageError}
            </div>
          ) : null}

          {editingId ? <input type="hidden" name="id" value={editingId} /> : null}
          {existingImages.map((url) => (
            <input key={url} type="hidden" name="existingImages" value={url} />
          ))}
          {form.categories.map((category) => (
            <input key={category} type="hidden" name="categories" value={category} />
          ))}

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">Título</span>
            <input
              name="title"
              required
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className={fieldClassName}
              style={{ width: "100%" }}
            />
          </label>

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">
              Descripción corta
            </span>
            <textarea
              name="shortDescription"
              rows={2}
              value={form.shortDescription}
              onChange={(event) =>
                setForm({ ...form, shortDescription: event.target.value })
              }
              className={fieldClassName}
              style={{ width: "100%" }}
            />
          </label>

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">Descripción</span>
            <textarea
              name="fullDescription"
              required
              rows={4}
              value={form.fullDescription}
              onChange={(event) =>
                setForm({ ...form, fullDescription: event.target.value })
              }
              className={fieldClassName}
              style={{ width: "100%" }}
            />
          </label>

          <fieldset className="flex flex-col gap-xs">
            <legend className="text-sm text-on-surface-variant">Categorías</legend>
            <div className="flex flex-col gap-xs">
              {catalogCategories.map((category) => (
                <label key={category.id} className="inline-flex items-center gap-xs">
                  <input
                    type="checkbox"
                    checked={form.categories.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                  />
                  <span className="text-on-surface">{category.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">
              Temáticas (separadas por coma)
            </span>
            <input
              name="topics"
              value={form.topics}
              placeholder="infantil, personajes, iluminacion"
              onChange={(event) => setForm({ ...form, topics: event.target.value })}
              className={fieldClassName}
              style={{ width: "100%" }}
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">Medidas</span>
              <input
                name="dimensions"
                value={form.dimensions}
                onChange={(event) =>
                  setForm({ ...form, dimensions: event.target.value })
                }
                className={fieldClassName}
                style={{ width: "100%" }}
              />
            </label>
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">Acabado</span>
              <input
                name="finish"
                value={form.finish}
                onChange={(event) => setForm({ ...form, finish: event.target.value })}
                className={fieldClassName}
                style={{ width: "100%" }}
              />
            </label>
          </div>

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">Precio</span>
            <MoneyInput
              name="price"
              value={form.price}
              onChange={(value) => setForm({ ...form, price: value })}
            />
          </label>

          <div className="flex flex-wrap gap-md">
            <label className="inline-flex items-center gap-xs">
              <input
                name="customizable"
                type="checkbox"
                checked={form.customizable}
                onChange={(event) =>
                  setForm({ ...form, customizable: event.target.checked })
                }
              />
              <span className="text-on-surface">Personalizable</span>
            </label>
            <label className="inline-flex items-center gap-xs">
              <input
                name="hidden"
                type="checkbox"
                checked={form.hidden}
                onChange={(event) =>
                  setForm({ ...form, hidden: event.target.checked })
                }
              />
              <span className="text-on-surface">Ocultar de la galería</span>
            </label>
          </div>

          <div className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">
              Fotos ({existingImages.length + newFiles.length}/{MAX_PRODUCT_IMAGES})
            </span>
            <div className="grid grid-cols-3 gap-sm">
              {existingImages.map((url, index) => (
                <div
                  key={url}
                  className="relative aspect-square overflow-hidden rounded-lg bg-surface-container-low"
                >
                  <Image src={url} alt="" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => removeExisting(index)}
                    className="absolute top-1 right-1 h-7 w-7 rounded-full bg-black/70 text-white"
                    aria-label="Quitar imagen"
                  >
                    ×
                  </button>
                </div>
              ))}
              {newFiles.map((file) => (
                <div
                  key={file.preview}
                  className="relative aspect-square overflow-hidden rounded-lg bg-surface-container-low"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={file.preview} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      removeNew(newFiles.findIndex((item) => item.preview === file.preview))
                    }
                    className="absolute top-1 right-1 h-7 w-7 rounded-full bg-black/70 text-white"
                    aria-label="Quitar imagen"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {remainingSlots > 0 ? (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => onSelectImages(event.target.files)}
                className={fieldClassName}
                style={{ width: "100%" }}
              />
            ) : null}
            {newFiles.map((file) => (
              <input
                key={file.preview}
                type="hidden"
                name="imageBase64"
                value={file.base64}
              />
            ))}
          </div>

          <div className="flex gap-sm mt-sm">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-lg bg-primary-container px-6 py-3 text-white font-label-caps text-label-caps tracking-widest uppercase hover:bg-secondary-container transition-colors disabled:opacity-50"
            >
              {pending
                ? "Guardando..."
                : editingId
                  ? "Guardar cambios"
                  : "Crear producto"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-outline-variant/40 px-4 py-3 text-on-surface-variant font-label-caps text-label-caps tracking-widest uppercase"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      </article>

      <article className="rounded-2xl border border-outline-variant/20 bg-surface-container p-lg">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
          Productos ({products.length})
        </h3>
        {products.length === 0 ? (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-lg text-center text-on-surface-variant">
            Todavía no hay productos cargados.
          </div>
        ) : (
          <div className="flex flex-col gap-sm">
            {products.map((product) => {
              const id = productId(product);
              const hidden = !product.isActive;

              return (
                <div
                  key={id}
                  className={
                    id === editingId
                      ? "flex gap-sm rounded-xl border border-primary/40 bg-primary/10 p-sm"
                      : "flex gap-sm rounded-xl border border-outline-variant/20 bg-surface-container-low p-sm"
                  }
                  style={{ opacity: hidden ? 0.65 : 1 }}
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                    {product.featuredImage ? (
                      <Image
                        src={product.featuredImage}
                        alt={product.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-on-surface-variant">
                        <MaterialIcon name="image" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-headline-md text-on-surface truncate">
                      {product.title}
                    </p>
                    <p className="text-sm text-on-surface-variant">
                      {product.categories.map(categoryLabel).join(" · ")}
                      {product.price != null
                        ? ` · ${formatProductPrice(product.price)}`
                        : ""}
                    </p>
                    {hidden ? (
                      <p className="mt-1 text-sm text-secondary">Oculto</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-start gap-xs">
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
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-primary hover:bg-primary/10 disabled:opacity-50"
                        aria-label={
                          hidden
                            ? `Mostrar ${product.title}`
                            : `Ocultar ${product.title}`
                        }
                        title={hidden ? "Mostrar en galería" : "Ocultar de la galería"}
                      >
                        <MaterialIcon
                          name={hidden ? "visibility" : "visibility_off"}
                          className="text-base"
                        />
                      </button>
                    </form>
                    <button
                      type="button"
                      onClick={() => startEdit(product)}
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
    </section>
  );
}
