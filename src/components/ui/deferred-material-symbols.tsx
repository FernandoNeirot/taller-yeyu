"use client";

import { useEffect } from "react";
import { MATERIAL_SYMBOLS_HREF } from "./material-symbols";

export function DeferredMaterialSymbols() {
  useEffect(() => {
    const existing = document.querySelector(
      `link[data-material-symbols="true"]`,
    );
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = MATERIAL_SYMBOLS_HREF;
    link.dataset.materialSymbols = "true";
    document.head.appendChild(link);
  }, []);

  return null;
}
