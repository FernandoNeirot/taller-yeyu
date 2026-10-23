"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MaterialCatalogItem } from "@/features/quotes/types";
import type { Product } from "@/types/product";
import {
  costQuoteFormTotal,
  costQuoteMinutes,
  costQuoteToForm,
  emptyCostQuoteForm,
  type CostQuoteFormState,
} from "../components/product-cost-quote";
import {
  defaultOpenSections,
  emptyProductForm,
  errorSection,
  newRowId,
  normalizeSearch,
  productId,
  productToForm,
  validateProductForm,
  type FormSectionId,
  type ProductFormErrors,
  type ProductFormState,
} from "../lib/product-form-state";
import { parseProductCreateJson } from "../lib/product-create-json";
import { normalizeThickness, THICKNESS_HINT } from "../lib/product-specs";
import {
  MAX_PRODUCT_IMAGES,
  compressImageToWebp,
  fileToBase64,
} from "../utils/compress-image";

export type NewProductImage = { preview: string; base64: string };

function revokeAll(files: NewProductImage[]) {
  files.forEach((file) => URL.revokeObjectURL(file.preview));
}

/** Foto del formulario para detectar cambios sin guardar (ignora los ids de filas). */
function snapshot(
  form: ProductFormState,
  costQuote: CostQuoteFormState,
  existingImages: string[],
  newFileCount: number,
) {
  return JSON.stringify(
    { form, costQuote, existingImages, newFileCount },
    (key, value) => (key === "id" ? undefined : value),
  );
}

const emptySnapshot = snapshot(emptyProductForm, emptyCostQuoteForm, [], 0);

/**
 * Estado del formulario de producto (datos, cotizador y fotos).
 * Los componentes `ProductForm`, `ProductCostSection` y `ProductImageUploader`
 * solo leen de acá y llaman a estas acciones.
 */
export function useProductForm({
  accessories,
  existingSlugs = [],
}: {
  accessories: MaterialCatalogItem[];
  /** Ids de los productos que ya existen: un producto nuevo no puede repetirlos. */
  existingSlugs?: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyProductForm);
  const [costQuote, setCostQuote] =
    useState<CostQuoteFormState>(emptyCostQuoteForm);
  const [openSections, setOpenSections] = useState(defaultOpenSections);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<NewProductImage[]>([]);
  const [imageError, setImageError] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [baseline, setBaseline] = useState(emptySnapshot);

  // Las vistas previas se liberan al quitar/reiniciar y al desmontar.
  const newFilesRef = useRef(newFiles);
  useEffect(() => {
    newFilesRef.current = newFiles;
  }, [newFiles]);
  useEffect(() => () => revokeAll(newFilesRef.current), []);

  const photoCount = existingImages.length + newFiles.length;
  const remainingSlots = MAX_PRODUCT_IMAGES - photoCount;

  const takenSlugs = useMemo(
    () => (editingId ? new Set<string>() : new Set(existingSlugs)),
    [editingId, existingSlugs],
  );
  const errors = useMemo(
    () => validateProductForm(form, photoCount, takenSlugs),
    [form, photoCount, takenSlugs],
  );
  const isDirty =
    snapshot(form, costQuote, existingImages, newFiles.length) !== baseline;
  const visibleErrors: ProductFormErrors = showErrors ? errors : {};
  const quoteTotal = costQuoteFormTotal(costQuote, accessories);
  const quoteMinutes = costQuoteMinutes(costQuote);

  // ── Campos ────────────────────────────────────────────────────────────

  const updateForm = useCallback((patch: Partial<ProductFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  }, []);

  const toggleCategory = useCallback((categoryId: string) => {
    setForm((current) => ({
      ...current,
      categories: current.categories.includes(categoryId)
        ? current.categories.filter((item) => item !== categoryId)
        : [...current.categories, categoryId],
    }));
  }, []);

  /** Sin luz no hay alimentación; con luz se parte de "pila" para no dejarlo inválido. */
  const setHasLighting = useCallback((hasLighting: boolean) => {
    setForm((current) => ({
      ...current,
      hasLighting,
      powerSource: hasLighting
        ? current.powerSource === "ninguno"
          ? "pila"
          : current.powerSource
        : "ninguno",
    }));
  }, []);

  const toggleSection = useCallback((id: FormSectionId) => {
    setOpenSections((current) => ({ ...current, [id]: !current[id] }));
  }, []);

  // ── Fotos ─────────────────────────────────────────────────────────────

  const selectImages = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;

      const incoming = Array.from(files).slice(0, Math.max(remainingSlots, 0));
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
    },
    [remainingSlots],
  );

  const removeExistingImage = useCallback((url: string) => {
    setExistingImages((prev) => prev.filter((item) => item !== url));
  }, []);

  const removeNewImage = useCallback((preview: string) => {
    setNewFiles((prev) => {
      const target = prev.find((item) => item.preview === preview);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((item) => item.preview !== preview);
    });
  }, []);

  // ── Ciclo de vida del formulario ──────────────────────────────────────

  /** Deja el formulario vacío sin tocar si el modal está abierto. */
  const resetFields = useCallback(() => {
    setForm(emptyProductForm);
    setCostQuote(emptyCostQuoteForm);
    setOpenSections(defaultOpenSections);
    setEditingId(null);
    setExistingImages([]);
    setNewFiles((current) => {
      revokeAll(current);
      return [];
    });
    setImageError("");
    setShowErrors(false);
    setBaseline(emptySnapshot);
  }, []);

  const close = useCallback(() => {
    resetFields();
    setIsOpen(false);
  }, [resetFields]);

  /** Cierra pidiendo confirmación si hay cambios sin guardar. */
  const requestClose = useCallback(() => {
    if (isDirty && !window.confirm("Hay cambios sin guardar. ¿Cerrar igual?")) {
      return;
    }
    close();
  }, [close, isDirty]);

  const startCreate = useCallback(() => {
    resetFields();
    setIsOpen(true);
  }, [resetFields]);

  /** Abre el formulario con los datos de un producto (para editarlo o duplicarlo). */
  const openWithProduct = useCallback(
    (product: Product, mode: "edit" | "duplicate") => {
      const nextForm = productToForm(product);
      const nextQuote = costQuoteToForm(product.costQuote);
      // Una copia no comparte fotos con el original: borrar uno rompería el otro.
      const images =
        mode === "edit" ? product.galleryImages.slice(0, MAX_PRODUCT_IMAGES) : [];

      setForm(nextForm);
      setCostQuote(nextQuote);
      setOpenSections({
        ...defaultOpenSections,
        price: Boolean(
          product.packOptions?.length ||
            product.quantityPrices?.length ||
            product.variants?.length,
        ),
        quote: Boolean(product.costQuote),
        photos: mode === "duplicate",
      });
      setEditingId(mode === "edit" ? productId(product) : null);
      setExistingImages(images);
      setNewFiles((current) => {
        revokeAll(current);
        return [];
      });
      setImageError("");
      setShowErrors(false);
      setBaseline(snapshot(nextForm, nextQuote, images, 0));
      setIsOpen(true);
    },
    [],
  );

  const startEdit = useCallback(
    (product: Product) => openWithProduct(product, "edit"),
    [openWithProduct],
  );

  /** Producto nuevo con los datos de otro, sin fotos: solo falta cambiar el título. */
  const startDuplicate = useCallback(
    (product: Product) => openWithProduct(product, "duplicate"),
    [openWithProduct],
  );

  /** Refresca el formulario si el producto que se edita cambió desde la lista. */
  const syncEditedProduct = useCallback(
    (product: Product) => {
      if (editingId === productId(product)) setForm(productToForm(product));
    },
    [editingId],
  );

  /**
   * Valida antes de enviar. Si hay errores, los muestra y abre las secciones
   * afectadas. Devuelve `true` si se puede enviar.
   */
  const validate = useCallback(() => {
    setShowErrors(true);
    const keys = Object.keys(errors) as (keyof ProductFormErrors)[];
    if (keys.length === 0) return true;

    setOpenSections((current) => {
      const next = { ...current };
      for (const key of keys) next[errorSection[key]] = true;
      return next;
    });
    return false;
  }, [errors]);

  // ── Importación por JSON ──────────────────────────────────────────────

  const applyProductJson = useCallback(
    (raw: string) => {
      const { product, warnings } = parseProductCreateJson(raw);
      const importWarnings = [...warnings];
      const quote = product.costQuote;

      const thickness = normalizeThickness(product.thickness);
      if (thickness === null) {
        importWarnings.push(
          `Se ignoró el espesor "${product.thickness}". ${THICKNESS_HINT}`,
        );
      }

      const nextQuote = quote
        ? costQuoteToForm({
            woods: quote.woods.flatMap((wood) => {
              const quantity = Number(wood.quantity);
              const widthCm = Number(wood.widthCm);
              const lengthCm = Number(wood.lengthCm);
              if (!wood.face && !quantity && !widthCm && !lengthCm) return [];
              return [
                {
                  id: newRowId(),
                  quantity: quantity || undefined,
                  widthCm: widthCm || undefined,
                  lengthCm: lengthCm || undefined,
                  face: wood.face || undefined,
                },
              ];
            }),
            machineMinutes: Number(quote.machineMinutes) || undefined,
            machineHourlyRate: Number(quote.machineHourlyRate) || undefined,
            laborMinutes: Number(quote.laborMinutes) || undefined,
            laborHourlyRate: Number(quote.laborHourlyRate) || undefined,
            accessories: quote.accessories.flatMap((row) => {
              const material = accessories.find((item) => {
                if (row.materialId && item.id === row.materialId) return true;
                const name = normalizeSearch(row.materialName);
                return Boolean(name) && normalizeSearch(item.name) === name;
              });
              if (!material) {
                const label = row.materialName || row.materialId;
                importWarnings.push(`No encontré el accesorio "${label}".`);
                return [];
              }
              const quantity = Number(row.quantity) || 0;
              return [
                {
                  id: newRowId(),
                  materialId: material.id,
                  materialName: material.name,
                  quantity,
                  unitPrice: material.unitPrice ?? 0,
                  measureType: material.measureType,
                  amount: quantity * (material.unitPrice ?? 0),
                },
              ];
            }),
            usesPaint: quote.usesPaint,
            paintAmount: Number(quote.paintAmount) || undefined,
          })
        : emptyCostQuoteForm;

      setForm({
        title: product.title,
        shortDescription: product.shortDescription,
        fullDescription: product.fullDescription,
        categories: product.categories,
        topics: product.topics,
        dimensions: product.dimensions,
        heightCm: product.heightCm,
        widthCm: product.widthCm,
        depthCm: product.depthCm,
        diameterCm: product.diameterCm,
        finish: product.finish,
        thickness: thickness ?? "",
        hasLighting: product.hasLighting,
        powerSource: product.powerSource,
        customizable: product.customizable,
        hidden: product.hidden,
        price: product.price,
        packOptions: product.packOptions.map((row) => ({
          id: newRowId(),
          quantity: row.quantity,
          price: row.price,
        })),
        quantityPrices: product.quantityPrices.map((row) => ({
          id: newRowId(),
          quantity: row.quantity,
          price: row.price,
        })),
        variants: product.variants.map((row) => ({
          id: newRowId(),
          description: row.description,
          price: row.price,
        })),
      });
      setCostQuote(nextQuote);
      setOpenSections({
        basic: true,
        classify: true,
        measures: true,
        price: true,
        quote: quote != null,
        photos: true,
      });
      return importWarnings;
    },
    [accessories],
  );

  return {
    // estado
    isOpen,
    editingId,
    form,
    costQuote,
    openSections,
    existingImages,
    newFiles,
    imageError,
    remainingSlots,
    quoteTotal,
    quoteMinutes,
    errors: visibleErrors,
    // campos
    updateForm,
    toggleCategory,
    setHasLighting,
    setCostQuote,
    toggleSection,
    // fotos
    selectImages,
    removeExistingImage,
    removeNewImage,
    // ciclo de vida
    isDirty,
    startCreate,
    startEdit,
    startDuplicate,
    requestClose,
    resetFields,
    close,
    syncEditedProduct,
    validate,
    applyProductJson,
  };
}

export type ProductFormController = ReturnType<typeof useProductForm>;
