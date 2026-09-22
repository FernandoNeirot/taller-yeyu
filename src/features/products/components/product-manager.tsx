"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { MaterialIcon } from "@/components/ui/material-icon";
import { MoneyInput } from "@/components/ui/money-input";
import {
  catalogCategories,
  topicLabel,
  type Product,
} from "@/types/product";
import { deleteProductAction } from "../actions/delete-product";
import { saveProductAction } from "../actions/save-product";
import { toggleProductVisibilityAction } from "../actions/toggle-product-visibility";
import {
  MAX_PRODUCT_IMAGES,
  compressImageToWebp,
  fileToBase64,
} from "../utils/compress-image";
import { formatProductPrice } from "../lib/format-price";
import { ProductDetailModal } from "./product-detail-modal";
import {
  ProductCostQuoteFields,
  costQuoteToForm,
  emptyCostQuoteForm,
  type CostQuoteFormState,
} from "./product-cost-quote";
import type { MaterialCatalogItem } from "@/features/quotes/types";

type FormState = {
  title: string;
  shortDescription: string;
  fullDescription: string;
  categories: string[];
  topics: string;
  dimensions: string;
  heightCm: string;
  widthCm: string;
  depthCm: string;
  diameterCm: string;
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
  heightCm: "",
  widthCm: "",
  depthCm: "",
  diameterCm: "",
  finish: "",
  customizable: true,
  hidden: false,
  price: "",
};

type FormSectionId =
  | "basic"
  | "classify"
  | "measures"
  | "price"
  | "quote"
  | "photos";

const defaultOpenSections: Record<FormSectionId, boolean> = {
  basic: true,
  classify: false,
  measures: false,
  price: false,
  quote: false,
  photos: false,
};

function FormSection({
  id,
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  summary?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-outline-variant/30 bg-surface-container-low/40">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-sm px-4 py-3 text-left"
      >
        <span className="min-w-0">
          <span className="block font-semibold text-on-surface">{title}</span>
          {!open && summary ? (
            <span className="mt-0.5 block text-xs text-on-surface-variant">
              {summary}
            </span>
          ) : null}
        </span>
        <MaterialIcon name={open ? "expand_less" : "expand_more"} />
      </button>
      <div
        id={id}
        hidden={!open}
        className={open ? "flex flex-col gap-sm px-4 pb-4" : undefined}
      >
        {children}
      </div>
    </section>
  );
}

type VisibilityFilter = "all" | "visible" | "hidden";

const visibilityFilters: { id: VisibilityFilter; label: string }[] = [
  { id: "all", label: "Mostrar todo" },
  { id: "visible", label: "Visibles" },
  { id: "hidden", label: "Ocultos" },
];

const fieldClassName =
  "w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary";

function productId(product: Product) {
  return product.id ?? product.slug;
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function productToForm(product: Product): FormState {
  return {
    title: product.title,
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    categories: product.categories,
    topics: product.topics.map(topicLabel).join(", "),
    dimensions: product.specifications.dimensions,
    heightCm:
      product.specifications.heightCm != null
        ? String(product.specifications.heightCm)
        : "",
    widthCm:
      product.specifications.widthCm != null
        ? String(product.specifications.widthCm)
        : "",
    depthCm:
      product.specifications.depthCm != null
        ? String(product.specifications.depthCm)
        : "",
    diameterCm:
      product.specifications.diameterCm != null
        ? String(product.specifications.diameterCm)
        : "",
    finish: product.specifications.finish,
    customizable: product.specifications.customizable,
    hidden: !product.isActive,
    price: product.price == null ? "" : String(product.price),
  };
}

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
  const [formOpen, setFormOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [costQuote, setCostQuote] =
    useState<CostQuoteFormState>(emptyCostQuoteForm);
  const [openSections, setOpenSections] = useState(defaultOpenSections);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<{ preview: string; base64: string }[]>(
    [],
  );
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formTitleId = useId();
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
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
      setCostQuote(emptyCostQuoteForm);
      setEditingId(null);
      setExistingImages([]);
      setNewFiles((current) => {
        current.forEach((file) => URL.revokeObjectURL(file.preview));
        return [];
      });
      setImageError("");
      setFormOpen(false);
    }
  }

  if (deleteState !== prevDeleteState) {
    setPrevDeleteState(deleteState);
    const deletedId = deleteState?.deletedId;
    if (deletedId) {
      setProducts((prev) => prev.filter((item) => productId(item) !== deletedId));
      if (editingId === deletedId) {
        setForm(emptyForm);
        setCostQuote(emptyCostQuoteForm);
        setEditingId(null);
        setExistingImages([]);
        setNewFiles((current) => {
          current.forEach((file) => URL.revokeObjectURL(file.preview));
          return [];
        });
        setImageError("");
        setFormOpen(false);
      }
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
      if (editingId === productId(updated)) {
        setForm(productToForm(updated));
      }
      if (previewProduct && productId(previewProduct) === productId(updated)) {
        setPreviewProduct(updated);
      }
    }
  }

  const resetFormFields = useCallback(() => {
    setForm(emptyForm);
    setCostQuote(emptyCostQuoteForm);
    setOpenSections(defaultOpenSections);
    setEditingId(null);
    setExistingImages([]);
    setNewFiles((current) => {
      current.forEach((file) => URL.revokeObjectURL(file.preview));
      return [];
    });
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const resetForm = useCallback(() => {
    resetFormFields();
    setFormOpen(false);
  }, [resetFormFields]);

  useEffect(() => {
    return () => {
      newFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [newFiles]);

  useEffect(() => {
    if (!formOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [formOpen]);

  useEffect(() => {
    if (!formOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      resetForm();
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [formOpen, resetForm]);

  function startCreate() {
    resetFormFields();
    setPreviewProduct(null);
    setFormOpen(true);
  }

  function toggleSection(id: FormSectionId) {
    setOpenSections((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function startEdit(product: Product) {
    setForm(productToForm(product));
    setCostQuote(costQuoteToForm(product.costQuote));
    setOpenSections({
      ...defaultOpenSections,
      quote: Boolean(product.costQuote),
    });
    setEditingId(productId(product));
    setExistingImages(product.galleryImages.slice(0, MAX_PRODUCT_IMAGES));
    setNewFiles((current) => {
      current.forEach((file) => URL.revokeObjectURL(file.preview));
      return [];
    });
    setImageError("");
    setPreviewProduct(null);
    setFormOpen(true);
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

  const formModal =
    formOpen && isClient
      ? createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100dvh",
              zIndex: 2147483646,
              background: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              padding: "24px 16px",
              overflowY: "auto",
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={formTitleId}
              className="rounded-2xl border border-outline-variant/30 bg-surface-container"
              style={{
                width: "100%",
                maxWidth: "40rem",
                marginTop: "auto",
                marginBottom: "auto",
                boxSizing: "border-box",
                padding: 24,
              }}
            >
              <div className="mb-md flex items-start justify-between gap-sm">
                <h2
                  id={formTitleId}
                  className="font-headline-md text-headline-md text-on-surface"
                >
                  {editingId ? "Editar producto" : "Crear producto"}
                </h2>
                <button
                  type="button"
                  aria-label="Cerrar"
                  onClick={resetForm}
                  className="touch-target inline-flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                  style={{ minHeight: 44, minWidth: 44, flexShrink: 0 }}
                >
                  <MaterialIcon name="close" />
                </button>
              </div>

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

                {editingId ? (
                  <input type="hidden" name="id" value={editingId} />
                ) : null}
                {existingImages.map((url) => (
                  <input
                    key={url}
                    type="hidden"
                    name="existingImages"
                    value={url}
                  />
                ))}
                {form.categories.map((category) => (
                  <input
                    key={category}
                    type="hidden"
                    name="categories"
                    value={category}
                  />
                ))}

                <FormSection
                  id="product-section-basic"
                  title="Datos básicos"
                  summary={form.title.trim() || "Título y descripciones"}
                  open={openSections.basic}
                  onToggle={() => toggleSection("basic")}
                >
                  <label className="flex flex-col gap-xs">
                    <span className="text-sm text-on-surface-variant">Título</span>
                    <input
                      name="title"
                      required
                      value={form.title}
                      onChange={(event) =>
                        setForm({ ...form, title: event.target.value })
                      }
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
                    <span className="text-sm text-on-surface-variant">
                      Descripción
                    </span>
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
                </FormSection>

                <FormSection
                  id="product-section-classify"
                  title="Clasificación"
                  summary={
                    [
                      form.categories.length
                        ? `${form.categories.length} ${
                            form.categories.length === 1
                              ? "categoría"
                              : "categorías"
                          }`
                        : "Sin categorías",
                      form.topics.trim() || null,
                    ]
                      .filter(Boolean)
                      .join(" · ")
                  }
                  open={openSections.classify}
                  onToggle={() => toggleSection("classify")}
                >
                  <fieldset className="flex flex-col gap-xs">
                    <legend className="text-sm text-on-surface-variant">
                      Categorías
                    </legend>
                    <div className="flex flex-col gap-xs">
                      {catalogCategories.map((category) => (
                        <label
                          key={category.id}
                          className="inline-flex items-center gap-xs"
                        >
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
                      onChange={(event) =>
                        setForm({ ...form, topics: event.target.value })
                      }
                      className={fieldClassName}
                      style={{ width: "100%" }}
                    />
                  </label>
                </FormSection>

                <input type="hidden" name="dimensions" value={form.dimensions} />
                <FormSection
                  id="product-section-measures"
                  title="Medidas y acabado"
                  summary={
                    [
                      form.heightCm && `Alto ${form.heightCm}`,
                      form.widthCm && `Ancho ${form.widthCm}`,
                      form.depthCm && `Prof. ${form.depthCm}`,
                      form.diameterCm && `Diám. ${form.diameterCm}`,
                      form.finish.trim() || null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Sin medidas"
                  }
                  open={openSections.measures}
                  onToggle={() => toggleSection("measures")}
                >
                  <fieldset className="flex flex-col gap-xs">
                    <legend className="text-sm text-on-surface-variant">
                      Medidas (cm)
                    </legend>
                    <div className="grid grid-cols-2 gap-sm">
                      <label className="flex flex-col gap-xs">
                        <span className="text-sm text-on-surface-variant">
                          Alto
                        </span>
                        <input
                          name="heightCm"
                          inputMode="decimal"
                          value={form.heightCm}
                          placeholder="Opcional"
                          onChange={(event) =>
                            setForm({ ...form, heightCm: event.target.value })
                          }
                          className={fieldClassName}
                          style={{ width: "100%" }}
                        />
                      </label>
                      <label className="flex flex-col gap-xs">
                        <span className="text-sm text-on-surface-variant">
                          Ancho
                        </span>
                        <input
                          name="widthCm"
                          inputMode="decimal"
                          value={form.widthCm}
                          placeholder="Opcional"
                          onChange={(event) =>
                            setForm({ ...form, widthCm: event.target.value })
                          }
                          className={fieldClassName}
                          style={{ width: "100%" }}
                        />
                      </label>
                      <label className="flex flex-col gap-xs">
                        <span className="text-sm text-on-surface-variant">
                          Profundo
                        </span>
                        <input
                          name="depthCm"
                          inputMode="decimal"
                          value={form.depthCm}
                          placeholder="Opcional"
                          onChange={(event) =>
                            setForm({ ...form, depthCm: event.target.value })
                          }
                          className={fieldClassName}
                          style={{ width: "100%" }}
                        />
                      </label>
                      <label className="flex flex-col gap-xs">
                        <span className="text-sm text-on-surface-variant">
                          Diámetro
                        </span>
                        <input
                          name="diameterCm"
                          inputMode="decimal"
                          value={form.diameterCm}
                          placeholder="Opcional"
                          onChange={(event) =>
                            setForm({ ...form, diameterCm: event.target.value })
                          }
                          className={fieldClassName}
                          style={{ width: "100%" }}
                        />
                      </label>
                    </div>
                  </fieldset>
                  <label className="flex flex-col gap-xs">
                    <span className="text-sm text-on-surface-variant">
                      Acabado
                    </span>
                    <input
                      name="finish"
                      value={form.finish}
                      onChange={(event) =>
                        setForm({ ...form, finish: event.target.value })
                      }
                      className={fieldClassName}
                      style={{ width: "100%" }}
                    />
                  </label>
                </FormSection>

                <FormSection
                  id="product-section-price"
                  title="Precio y publicación"
                  summary={
                    [
                      form.price
                        ? formatProductPrice(Number(form.price) || 0)
                        : "Sin precio",
                      form.hidden ? "Oculto" : "Visible",
                    ].join(" · ")
                  }
                  open={openSections.price}
                  onToggle={() => toggleSection("price")}
                >
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
                      <span className="text-on-surface">
                        Ocultar de la galería
                      </span>
                    </label>
                  </div>
                </FormSection>

                <FormSection
                  id="product-section-quote"
                  title="Cotizador"
                  summary={
                    [
                      costQuote.woods.length
                        ? `${costQuote.woods.length} ${
                            costQuote.woods.length === 1 ? "madera" : "maderas"
                          }`
                        : null,
                      costQuote.machineMinutes
                        ? `${costQuote.machineMinutes} min`
                        : null,
                      costQuote.accessories.length
                        ? `${costQuote.accessories.length} adicionales`
                        : null,
                      costQuote.usesPaint ? "Pintura" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Sin costo"
                  }
                  open={openSections.quote}
                  onToggle={() => toggleSection("quote")}
                >
                  <ProductCostQuoteFields
                    value={costQuote}
                    onChange={setCostQuote}
                    accessories={accessories}
                  />
                </FormSection>

                <FormSection
                  id="product-section-photos"
                  title="Fotos"
                  summary={`${existingImages.length + newFiles.length}/${MAX_PRODUCT_IMAGES} fotos`}
                  open={openSections.photos}
                  onToggle={() => toggleSection("photos")}
                >
                  <div className="grid grid-cols-3 gap-sm">
                    {existingImages.map((url, index) => (
                      <div
                        key={url}
                        className="relative aspect-square overflow-hidden rounded-lg bg-surface-container-low"
                      >
                        <Image
                          src={url}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
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
                        <img
                          src={file.preview}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeNew(
                              newFiles.findIndex(
                                (item) => item.preview === file.preview,
                              ),
                            )
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
                </FormSection>

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
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-outline-variant/40 px-4 py-3 text-on-surface-variant font-label-caps text-label-caps tracking-widest uppercase"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <section>
      <article className="rounded-2xl border border-outline-variant/20 bg-surface-container p-lg">
        <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Productos ({products.length})
          </h3>
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary-container px-4 py-3 text-white font-label-caps text-label-caps tracking-widest uppercase hover:bg-secondary-container transition-colors"
          >
            <MaterialIcon name="add" className="text-base" />
            Nuevo producto
          </button>
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
                    id === editingId && formOpen
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

      {formModal}

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
