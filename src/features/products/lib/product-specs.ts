import type { PowerSource } from "@/types/product";

export const THICKNESS_HINT = "Usá un número con unidad, por ejemplo 3mm o 1.5cm.";

/**
 * Normaliza el espesor a "<número><mm|cm>" (ej: "1,5 CM" → "1.5cm").
 * Devuelve "" si está vacío y null si no tiene un formato válido.
 */
export function normalizeThickness(raw: string): string | null {
  const value = raw.trim().toLowerCase().replace(/\s+/g, "").replace(",", ".");
  if (!value) return "";
  const match = value.match(/^(\d+(?:\.\d+)?)(mm|cm)$/);
  if (!match) return null;
  if (Number(match[1]) <= 0) return null;
  return `${Number(match[1])}${match[2]}`;
}

export type ProductSpecsErrors = {
  thickness?: string;
  powerSource?: string;
};

/** Reglas de las especificaciones nuevas; las usan el formulario y el server action. */
export function validateProductSpecs(input: {
  thickness: string;
  hasLighting: boolean;
  powerSource: PowerSource;
}): { errors: ProductSpecsErrors; thickness: string } {
  const errors: ProductSpecsErrors = {};
  const thickness = normalizeThickness(input.thickness);

  if (thickness === null) {
    errors.thickness = `El espesor no es válido. ${THICKNESS_HINT}`;
  }

  if (input.hasLighting && input.powerSource === "ninguno") {
    errors.powerSource =
      "Un producto con luz necesita alimentación: elegí A pila o 220V.";
  } else if (!input.hasLighting && input.powerSource !== "ninguno") {
    errors.powerSource = "Sin luz, la alimentación tiene que ser “Sin electricidad”.";
  }

  return { errors, thickness: thickness ?? "" };
}
