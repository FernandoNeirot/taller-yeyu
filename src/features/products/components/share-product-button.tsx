"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { productUrl } from "../lib/product-url";

type ShareProductButtonProps = {
  title: string;
  text: string;
  slug: string;
};

export function ShareProductButton({
  title,
  text,
  slug,
}: ShareProductButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = productUrl(slug);
    const payload = {
      title,
      text: text || title,
      url,
    };

    try {
      if (typeof navigator.share === "function") {
        await navigator.share(payload);
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiá el enlace del producto", url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="touch-target inline-flex items-center justify-center gap-sm rounded-full border border-outline-variant/40 px-4 font-label-caps text-label-caps tracking-widest text-on-surface uppercase hover:bg-surface-container-high"
    >
      <MaterialIcon name="share" className="text-base" />
      {copied ? "Enlace copiado" : "Compartir"}
    </button>
  );
}
