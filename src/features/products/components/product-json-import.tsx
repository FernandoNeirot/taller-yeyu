"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { PRODUCT_CREATE_JSON_EXAMPLE } from "../lib/product-create-json";

const fieldClassName =
  "w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary";

export async function copyProductCreateJsonExample() {
  const text = PRODUCT_CREATE_JSON_EXAMPLE;
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    if (!copied) throw new Error("No se pudo copiar el ejemplo.");
  }
}

export function CopyProductJsonExampleButton({
  className = "inline-flex items-center justify-center gap-1 rounded-lg border border-outline-variant/40 px-4 py-3 text-on-surface",
}: {
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function copy() {
    try {
      await copyProductCreateJsonExample();
      setCopied(true);
      setError("");
    } catch (copyError) {
      setCopied(false);
      setError(
        copyError instanceof Error
          ? copyError.message
          : "No se pudo copiar el ejemplo.",
      );
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button type="button" onClick={copy} className={className}>
        <MaterialIcon
          name="content_copy"
          className="text-base leading-none normal-case tracking-normal"
        />
        {copied ? "JSON copiado" : "Copiar JSON de ejemplo"}
      </button>
      {error ? (
        <span className="text-sm text-error" role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}

export function ProductJsonImport({
  onApply,
}: {
  onApply: (raw: string) => string[];
}) {
  const [raw, setRaw] = useState("");
  const [exampleOpen, setExampleOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function apply() {
    setError("");
    setNotice("");
    try {
      const warnings = onApply(raw);
      setNotice(
        warnings.length > 0
          ? `Datos cargados. ${warnings.join(" ")} Las fotos se agregan aparte.`
          : "Datos cargados. Agregá las fotos para guardar.",
      );
    } catch (applyError) {
      setError(
        applyError instanceof Error
          ? applyError.message
          : "No se pudo leer el JSON.",
      );
    }
  }

  return (
    <section className="rounded-xl border border-outline-variant/30 bg-surface-container-low/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-sm">
        <div>
          <h3 className="font-semibold text-on-surface">Cargar desde JSON</h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            Pegá la recomendación del producto. Las fotos no van en el JSON:
            agregalas en Fotos.
          </p>
        </div>
        <div className="flex flex-wrap gap-sm">
          <CopyProductJsonExampleButton className="inline-flex items-center justify-center gap-1 rounded-lg border border-outline-variant/40 px-3 py-2 text-sm text-on-surface" />
          <button
            type="button"
            onClick={() => setExampleOpen((open) => !open)}
            className="rounded-lg border border-outline-variant/40 px-3 py-2 text-sm text-on-surface"
          >
            {exampleOpen ? "Ocultar ejemplo" : "Ver ejemplo"}
          </button>
        </div>
      </div>

      {exampleOpen ? (
        <div className="mt-sm">
          <pre className="max-h-80 overflow-auto rounded-lg bg-surface-container-low p-3 text-xs leading-relaxed text-on-surface">
            {PRODUCT_CREATE_JSON_EXAMPLE}
          </pre>
        </div>
      ) : null}

      <label className="mt-sm flex flex-col gap-xs">
        <span className="text-sm text-on-surface-variant">JSON del producto</span>
        <textarea
          value={raw}
          rows={6}
          spellCheck={false}
          placeholder="Pegá el JSON acá"
          onChange={(event) => {
            setRaw(event.target.value);
            setError("");
            setNotice("");
          }}
          className={`${fieldClassName} font-mono text-sm`}
        />
      </label>
      <button
        type="button"
        onClick={apply}
        className="mt-sm rounded-lg bg-primary-container px-4 py-2 text-white font-label-caps text-label-caps tracking-widest uppercase hover:bg-secondary-container transition-colors"
      >
        Aplicar JSON
      </button>
      {error ? (
        <p className="mt-sm text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? <p className="mt-sm text-sm text-on-surface-variant">{notice}</p> : null}
    </section>
  );
}
