"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MaterialIcon } from "@/components/ui/material-icon";
import { MoneyInput } from "@/components/ui/money-input";
import { saveProductAction } from "../actions/save-product";
import {
  productCategories,
  productCategoryLabels,
  type Product,
} from "../types";
import {
  MAX_PRODUCT_IMAGES,
  compressImageToWebp,
  fileToBase64,
} from "../utils/compress-image";

type FormState = {
  title: string;
  description: string;
  category: Product["category"];
  tag: string;
  alt: string;
  material: string;
  finish: string;
  customizable: boolean;
  featured: boolean;
  available: boolean;
  stock: string;
  price: string;
  instagramUrl: string;
  mercadoLibreUrl: string;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  category: "souvenirs",
  tag: "",
  alt: "",
  material: "Madera",
  finish: "",
  customizable: true,
  featured: false,
  available: true,
  stock: "",
  price: "",
  instagramUrl: "",
  mercadoLibreUrl: "",
};

function productToForm(product: Product): FormState {
  return {
    title: product.title,
    description: product.description,
    category: product.category,
    tag: product.tag,
    alt: product.alt,
    material: product.material,
    finish: product.finish,
    customizable: product.customizable,
    featured: product.featured,
    available: product.available,
    stock: product.stock == null ? "" : String(product.stock),
    price: product.price == null ? "" : String(product.price),
    instagramUrl: product.instagramUrl,
    mercadoLibreUrl: product.mercadoLibreUrl,
  };
}

export function ProductManager({
  products: initialProducts,
}: {
  products: Product[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<{ preview: string; base64: string }[]>(
    [],
  );
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, action, pending] = useActionState(saveProductAction, null);

  const remainingSlots = MAX_PRODUCT_IMAGES - existingImages.length - newFiles.length;

  useEffect(() => {
    const saved = state?.product;
    if (!saved) return;

    setProducts((prev) => {
      const exists = prev.some((item) => item.id === saved.id);
      const next = exists
        ? prev.map((item) => (item.id === saved.id ? saved : item))
        : [...prev, saved];
      return [...next].sort((a, b) => a.title.localeCompare(b.title, "es"));
    });
    resetForm();
  }, [state]);

  useEffect(() => {
    return () => {
      newFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [newFiles]);

  function resetForm() {
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

  function startEdit(product: Product) {
    setForm(productToForm(product));
    setEditingId(product.id);
    setExistingImages(product.images.slice(0, MAX_PRODUCT_IMAGES));
    setNewFiles((current) => {
      current.forEach((file) => URL.revokeObjectURL(file.preview));
      return [];
    });
    setImageError("");
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
        <p className="font-body-md text-body-md text-on-surface-variant mb-md">
          Hasta 3 fotos en WebP, cada una de menos de 50KB.
        </p>

        <form action={action} className="flex flex-col gap-sm">
          {state?.error ? (
            <div className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
              {state.error}
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

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">Título</span>
            <input
              name="title"
              required
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
            />
          </label>

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">Descripción</span>
            <textarea
              name="description"
              required
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">Categoría</span>
              <select
                name="category"
                value={form.category}
                onChange={(event) =>
                  setForm({
                    ...form,
                    category: event.target.value as Product["category"],
                  })
                }
                className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
              >
                {productCategories.map((category) => (
                  <option key={category} value={category}>
                    {productCategoryLabels[category]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">Etiqueta</span>
              <input
                name="tag"
                value={form.tag}
                placeholder={productCategoryLabels[form.category]}
                onChange={(event) => setForm({ ...form, tag: event.target.value })}
                className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">Material</span>
              <input
                name="material"
                value={form.material}
                onChange={(event) =>
                  setForm({ ...form, material: event.target.value })
                }
                className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">Acabado</span>
              <input
                name="finish"
                value={form.finish}
                onChange={(event) => setForm({ ...form, finish: event.target.value })}
                className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
              />
            </label>
          </div>

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">Texto alternativo</span>
            <input
              name="alt"
              value={form.alt}
              placeholder={form.title || "Descripción de la imagen"}
              onChange={(event) => setForm({ ...form, alt: event.target.value })}
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">Precio</span>
              <MoneyInput
                name="price"
                value={form.price}
                onChange={(value) => setForm({ ...form, price: value })}
              />
            </label>
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">Stock</span>
              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(event) => setForm({ ...form, stock: event.target.value })}
                className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
              />
            </label>
          </div>

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">Instagram</span>
            <input
              name="instagramUrl"
              type="text"
              placeholder="https://instagram.com/p/..."
              value={form.instagramUrl}
              onChange={(event) =>
                setForm({ ...form, instagramUrl: event.target.value })
              }
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
            />
          </label>

          <label className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">Mercado Libre</span>
            <input
              name="mercadoLibreUrl"
              type="text"
              placeholder="https://www.mercadolibre.com.ar/..."
              value={form.mercadoLibreUrl}
              onChange={(event) =>
                setForm({ ...form, mercadoLibreUrl: event.target.value })
              }
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
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
                name="featured"
                type="checkbox"
                checked={form.featured}
                onChange={(event) =>
                  setForm({ ...form, featured: event.target.checked })
                }
              />
              <span className="text-on-surface">Destacado</span>
            </label>
            <label className="inline-flex items-center gap-xs">
              <input
                name="available"
                type="checkbox"
                checked={form.available}
                onChange={(event) =>
                  setForm({ ...form, available: event.target.checked })
                }
              />
              <span className="text-on-surface">Disponible</span>
            </label>
          </div>

          <div className="flex flex-col gap-xs">
            <span className="text-sm text-on-surface-variant">
              Fotos ({existingImages.length + newFiles.length}/{MAX_PRODUCT_IMAGES})
            </span>
            <div className="grid grid-cols-3 gap-sm">
              {existingImages.map((url, index) => (
                <div key={url} className="relative aspect-square overflow-hidden rounded-lg bg-surface-container-low">
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
                <div key={file.preview} className="relative aspect-square overflow-hidden rounded-lg bg-surface-container-low">
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
                className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface"
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
            {products.map((product) => (
              <div
                key={product.id}
                className={
                  product.id === editingId
                    ? "flex gap-sm rounded-xl border border-primary/40 bg-primary/10 p-sm"
                    : "flex gap-sm rounded-xl border border-outline-variant/20 bg-surface-container-low p-sm"
                }
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.alt}
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
                    {productCategoryLabels[product.category]}
                    {product.price != null
                      ? ` · ${product.price.toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        })}`
                      : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(product)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-primary hover:bg-primary/10"
                  aria-label={`Editar ${product.title}`}
                  title="Editar"
                >
                  <MaterialIcon name="edit" className="text-base" />
                </button>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
