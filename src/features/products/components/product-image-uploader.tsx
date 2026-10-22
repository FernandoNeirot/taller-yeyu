"use client";

import Image from "next/image";
import { useRef } from "react";
import { MAX_PRODUCT_IMAGES } from "../utils/compress-image";
import type { NewProductImage } from "../hooks/use-product-form";
import { FieldError, FormSection, fieldClassName } from "./product-form-ui";

type ProductImageUploaderProps = {
  existingImages: string[];
  newFiles: NewProductImage[];
  remainingSlots: number;
  error?: string;
  open: boolean;
  onToggle: () => void;
  onSelect: (files: FileList | null) => Promise<void>;
  onRemoveExisting: (url: string) => void;
  onRemoveNew: (preview: string) => void;
};

/**
 * Fotos del producto. Las nuevas se comprimen a WebP en el navegador y viajan
 * como base64 (`imageBase64`); el server action las sube a Firebase Storage.
 * Las ya guardadas viajan como `existingImages`.
 */
export function ProductImageUploader({
  existingImages,
  newFiles,
  remainingSlots,
  error,
  open,
  onToggle,
  onSelect,
  onRemoveExisting,
  onRemoveNew,
}: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(files: FileList | null) {
    await onSelect(files);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <FormSection
      id="product-section-photos"
      title="Fotos"
      summary={`${existingImages.length + newFiles.length}/${MAX_PRODUCT_IMAGES} fotos`}
      open={open}
      hasError={Boolean(error)}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-3 gap-sm">
        {existingImages.map((url) => (
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
              onClick={() => onRemoveExisting(url)}
              className="absolute right-1 top-1 h-7 w-7 rounded-full bg-black/70 text-white"
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
              onClick={() => onRemoveNew(file.preview)}
              className="absolute right-1 top-1 h-7 w-7 rounded-full bg-black/70 text-white"
              aria-label="Quitar imagen"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <FieldError message={error} />
      {remainingSlots > 0 ? (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => handleChange(event.target.files)}
          className={fieldClassName}
        />
      ) : null}
      {existingImages.map((url) => (
        <input key={url} type="hidden" name="existingImages" value={url} />
      ))}
      {newFiles.map((file) => (
        <input
          key={file.preview}
          type="hidden"
          name="imageBase64"
          value={file.base64}
        />
      ))}
    </FormSection>
  );
}
