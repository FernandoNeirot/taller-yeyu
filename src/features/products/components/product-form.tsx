"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { MaterialIcon } from "@/components/ui/material-icon";
import { MoneyInput } from "@/components/ui/money-input";
import type { Material } from "@/types/material";
import {
  catalogCategories,
  powerSourceLabels,
  powerSources,
  topicLabel,
  type PowerSource,
} from "@/types/product";
import type { ProductFormController } from "../hooks/use-product-form";
import { formatProductPrice } from "../lib/format-price";
import { slugify } from "../lib/slug";
import {
  errorSection,
  packSummary,
  quantityPriceSummary,
  variantSummary,
  type FormSectionId,
  type ProductFormErrors,
} from "../lib/product-form-state";
import { ProductCostSection } from "./product-cost-section";
import {
  FieldError,
  FormBanner,
  FormSection,
  fieldClass,
} from "./product-form-ui";
import { ProductImageUploader } from "./product-image-uploader";
import { ProductJsonImport } from "./product-json-import";
import { ProductPackFields } from "./product-pack-fields";
import { ProductPricingFields } from "./product-pricing-fields";

const measureInputs = [
  { name: "heightCm", label: "Alto" },
  { name: "widthCm", label: "Ancho" },
  { name: "depthCm", label: "Profundo" },
  { name: "diameterCm", label: "Diámetro" },
] as const;

function sectionHasError(errors: ProductFormErrors, section: FormSectionId) {
  return (Object.keys(errors) as (keyof ProductFormErrors)[]).some(
    (key) => errorSection[key] === section,
  );
}

type ProductFormProps = {
  controller: ProductFormController;
  materials: Material[];
  action: (formData: FormData) => void;
  pending: boolean;
  serverError?: string;
  /** Confirmación del último guardado (útil con "Guardar y crear otro"). */
  notice?: string;
  /** Temáticas ya usadas en otros productos, para sumarlas con un clic. */
  topicSuggestions?: string[];
};

/** Modal con el formulario completo de alta/edición de un producto. */
export function ProductForm({
  controller,
  materials,
  action,
  pending,
  serverError,
  notice,
  topicSuggestions = [],
}: ProductFormProps) {
  const {
    isOpen,
    editingId,
    form,
    openSections,
    errors,
    updateForm,
    toggleCategory,
    setHasLighting,
    toggleSection,
    requestClose,
  } = controller;
  const titleId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const serverErrorRef = useRef<HTMLDivElement>(null);
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (document.querySelector("[data-price-calculator]")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      requestClose();
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [isOpen, requestClose]);

  // El error del servidor aparece arriba: llevarlo a la vista aunque el botón esté abajo.
  useEffect(() => {
    if (serverError) {
      serverErrorRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [serverError]);

  if (!isOpen || !isClient) return null;

  const hasPacks = form.packOptions.length > 0;
  const selectedTopics = new Set(
    form.topics.split(/[,\n]/).map((item) => slugify(item)).filter(Boolean),
  );
  const pendingSuggestions = topicSuggestions.filter(
    (topic) => !selectedTopics.has(topic),
  );

  /** Lleva el foco al primer campo con error (las secciones ya se abren solas). */
  function focusFirstError() {
    window.setTimeout(() => {
      const target =
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
        formRef.current?.querySelector<HTMLElement>('p[role="alert"]');
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
      target?.focus({ preventScroll: true });
    }, 60);
  }

  const section = (id: FormSectionId) => ({
    open: openSections[id],
    hasError: sectionHasError(errors, id),
    onToggle: () => toggleSection(id),
  });

  return createPortal(
    <div className="fixed inset-0 z-[2147483646] flex h-dvh w-screen items-start justify-center overflow-y-auto bg-black/80 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="my-auto box-border w-full max-w-160 rounded-2xl border border-outline-variant/30 bg-surface-container p-6"
      >
        <div className="mb-md flex items-start justify-between gap-sm">
          <h2
            id={titleId}
            className="font-headline-md text-headline-md text-on-surface"
          >
            {editingId ? "Editar producto" : "Crear producto"}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={requestClose}
            className="touch-target inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
          >
            <MaterialIcon name="close" />
          </button>
        </div>

        <form
          ref={formRef}
          action={action}
          noValidate
          onSubmit={(event) => {
            if (!controller.validate()) {
              event.preventDefault();
              focusFirstError();
            }
          }}
          onKeyDown={(event) => {
            // Ctrl/Cmd + Enter guarda sin tener que ir hasta el botón.
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
          className="flex flex-col gap-sm"
        >
          {notice ? (
            <div
              role="status"
              className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-on-surface"
            >
              {notice}
            </div>
          ) : null}
          {serverError ? (
            <div ref={serverErrorRef}>
              <FormBanner>{serverError}</FormBanner>
            </div>
          ) : null}
          {controller.imageError ? (
            <FormBanner>{controller.imageError}</FormBanner>
          ) : null}
          {Object.keys(errors).length > 0 ? (
            <FormBanner>Revisá los campos marcados antes de guardar.</FormBanner>
          ) : null}
          {editingId ? null : (
            <ProductJsonImport onApply={controller.applyProductJson} />
          )}

          {editingId ? <input type="hidden" name="id" value={editingId} /> : null}
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
            {...section("basic")}
          >
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">Título</span>
              <input
                name="title"
                autoFocus={!editingId}
                value={form.title}
                aria-invalid={Boolean(errors.title)}
                onChange={(event) => updateForm({ title: event.target.value })}
                className={fieldClass(errors.title)}
              />
              <FieldError message={errors.title} />
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
                  updateForm({ shortDescription: event.target.value })
                }
                className={fieldClass()}
              />
            </label>
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">Descripción</span>
              <textarea
                name="fullDescription"
                rows={4}
                value={form.fullDescription}
                aria-invalid={Boolean(errors.fullDescription)}
                onChange={(event) =>
                  updateForm({ fullDescription: event.target.value })
                }
                className={fieldClass(errors.fullDescription)}
              />
              <FieldError message={errors.fullDescription} />
            </label>
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">Espesor</span>
              <input
                name="thickness"
                value={form.thickness}
                placeholder="Ej: 3mm o 1.5cm"
                aria-invalid={Boolean(errors.thickness)}
                onChange={(event) =>
                  updateForm({ thickness: event.target.value })
                }
                className={fieldClass(errors.thickness)}
              />
              <FieldError message={errors.thickness} />
            </label>
            <label className="inline-flex w-fit items-center gap-xs">
              <input
                name="hasLighting"
                type="checkbox"
                checked={form.hasLighting}
                onChange={(event) => setHasLighting(event.target.checked)}
              />
              <span className="text-on-surface">Con luz</span>
            </label>
            {form.hasLighting ? (
              <label className="flex flex-col gap-xs">
                <span className="text-sm text-on-surface-variant">
                  Alimentación
                </span>
                <select
                  name="powerSource"
                  value={form.powerSource}
                  aria-invalid={Boolean(errors.powerSource)}
                  onChange={(event) =>
                    updateForm({ powerSource: event.target.value as PowerSource })
                  }
                  className={fieldClass(errors.powerSource)}
                >
                  {powerSources
                    .filter((source) => source !== "ninguno")
                    .map((source) => (
                      <option key={source} value={source}>
                        {powerSourceLabels[source]}
                      </option>
                    ))}
                </select>
              </label>
            ) : (
              // Sin luz no hay alimentación: se envía "ninguno" sin mostrar un campo vacío de sentido.
              <input type="hidden" name="powerSource" value="ninguno" />
            )}
            <FieldError message={errors.powerSource} />
          </FormSection>

          <FormSection
            id="product-section-classify"
            title="Clasificación"
            summary={[
              form.categories.length
                ? `${form.categories.length} ${
                    form.categories.length === 1 ? "categoría" : "categorías"
                  }`
                : "Sin categorías",
              form.topics.trim() || null,
            ]
              .filter(Boolean)
              .join(" · ")}
            {...section("classify")}
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
              <FieldError message={errors.categories} />
            </fieldset>
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">
                Temáticas (separadas por coma)
              </span>
              <input
                name="topics"
                value={form.topics}
                placeholder="infantil, personajes, iluminacion"
                onChange={(event) => updateForm({ topics: event.target.value })}
                className={fieldClass()}
              />
              {pendingSuggestions.length > 0 ? (
                <span className="flex flex-wrap items-center gap-1.5 text-xs text-on-surface-variant">
                  Ya usadas:
                  {pendingSuggestions.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() =>
                        updateForm({
                          topics: form.topics.trim()
                            ? `${form.topics.trim().replace(/,\s*$/, "")}, ${topicLabel(topic)}`
                            : topicLabel(topic),
                        })
                      }
                      className="rounded-full border border-outline-variant/40 px-2.5 py-1 text-on-surface hover:bg-surface-container-high"
                    >
                      + {topicLabel(topic)}
                    </button>
                  ))}
                </span>
              ) : null}
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
            {...section("measures")}
          >
            <fieldset className="flex flex-col gap-xs">
              <legend className="text-sm text-on-surface-variant">
                Medidas (cm)
              </legend>
              <div className="grid grid-cols-2 gap-sm">
                {measureInputs.map((field) => (
                  <label key={field.name} className="flex flex-col gap-xs">
                    <span className="text-sm text-on-surface-variant">
                      {field.label}
                    </span>
                    <input
                      name={field.name}
                      inputMode="decimal"
                      value={form[field.name]}
                      placeholder="Opcional"
                      aria-invalid={Boolean(errors[field.name])}
                      onChange={(event) =>
                        updateForm({ [field.name]: event.target.value })
                      }
                      className={fieldClass(errors[field.name])}
                    />
                    <FieldError message={errors[field.name]} />
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="flex flex-col gap-xs">
              <span className="text-sm text-on-surface-variant">Acabado</span>
              <input
                name="finish"
                value={form.finish}
                onChange={(event) => updateForm({ finish: event.target.value })}
                className={fieldClass()}
              />
            </label>
          </FormSection>

          <FormSection
            id="product-section-price"
            title="Precio y publicación"
            summary={[
              packSummary(form) ||
                variantSummary(form) ||
                quantityPriceSummary(form) ||
                (form.price
                  ? formatProductPrice(Number(form.price) || 0)
                  : "Sin precio"),
              form.hidden ? "Oculto" : "Visible",
            ].join(" · ")}
            {...section("price")}
          >
            <ProductPackFields
              form={form}
              onChange={updateForm}
              error={errors.packOptions}
            />
            {hasPacks ? (
              <p className="text-xs text-on-surface-variant">
                Con packs, el precio base, los precios por cantidad y las
                variantes no se usan: el cliente elige uno de los packs.
              </p>
            ) : (
              <>
                <label className="flex flex-col gap-xs">
                  <span className="text-sm text-on-surface-variant">Precio</span>
                  <MoneyInput
                    name="price"
                    value={form.price}
                    onChange={(value) => updateForm({ price: value })}
                  />
                  <FieldError message={errors.price} />
                </label>
                <ProductPricingFields
                  form={form}
                  onChange={updateForm}
                  errors={errors}
                />
              </>
            )}
            <div className="flex flex-wrap gap-md">
              <label className="inline-flex items-center gap-xs">
                <input
                  name="customizable"
                  type="checkbox"
                  checked={form.customizable}
                  onChange={(event) =>
                    updateForm({ customizable: event.target.checked })
                  }
                />
                <span className="text-on-surface">Personalizable</span>
              </label>
              <label className="inline-flex items-center gap-xs">
                <input
                  name="hidden"
                  type="checkbox"
                  checked={form.hidden}
                  onChange={(event) => updateForm({ hidden: event.target.checked })}
                />
                <span className="text-on-surface">Ocultar de la galería</span>
              </label>
            </div>
          </FormSection>

          <ProductCostSection
            value={controller.costQuote}
            onChange={controller.setCostQuote}
            materials={materials}
            total={controller.quoteTotal}
            minutes={controller.quoteMinutes}
            open={openSections.quote}
            onToggle={() => toggleSection("quote")}
          />

          <ProductImageUploader
            existingImages={controller.existingImages}
            newFiles={controller.newFiles}
            remainingSlots={controller.remainingSlots}
            error={errors.photos}
            open={openSections.photos}
            onToggle={() => toggleSection("photos")}
            onSelect={controller.selectImages}
            onRemoveExisting={controller.removeExistingImage}
            onRemoveNew={controller.removeNewImage}
          />

          {/* Barra fija: guardar siempre a mano, sin recorrer todo el formulario. */}
          <div className="sticky bottom-0 -mx-6 -mb-6 mt-sm flex flex-wrap gap-sm rounded-b-2xl border-t border-outline-variant/30 bg-surface-container px-6 py-3">
            <button
              type="submit"
              name="intent"
              value="save"
              disabled={pending}
              className="flex-1 rounded-lg bg-primary-container px-6 py-3 font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors hover:bg-secondary-container disabled:opacity-50"
            >
              {pending
                ? "Guardando..."
                : editingId
                  ? "Guardar cambios"
                  : "Crear producto"}
            </button>
            {editingId ? null : (
              <button
                type="submit"
                name="intent"
                value="another"
                disabled={pending}
                className="rounded-lg border border-primary/50 px-4 py-3 font-label-caps text-label-caps uppercase tracking-widest text-primary hover:bg-primary/10 disabled:opacity-50"
              >
                Guardar y crear otro
              </button>
            )}
            <button
              type="button"
              onClick={requestClose}
              className="rounded-lg border border-outline-variant/40 px-4 py-3 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
