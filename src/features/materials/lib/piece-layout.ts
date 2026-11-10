import { materialSheetBases, type Material } from "@/types/material";

export type PieceLayout = {
  /** Cuántas piezas entran en el espacio de trabajo de una placa/hoja. */
  perSheet: number;
  /** Espacio donde se acomodan (el de trabajo si está definido, si no la placa entera). */
  workWidthCm: number;
  workHeightCm: number;
  sheetAreaCm2: number;
  /** % de la placa que ocupan las piezas. */
  usedPercent: number;
  /** % de la placa que se pierde (márgenes + sobrante); se reparte entre las piezas. */
  wastePercent: number;
  /** La grilla elegida gira la pieza 90°. */
  rotated: boolean;
  columns: number;
  rows: number;
};

type LayoutMaterial = Pick<Material, "category" | "measureType"> &
  Partial<Pick<Material, "workArea">>;

function positive(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

/** Cantidad de rectángulos `w×h` que entran en `W×H` en grilla (sin mezclar orientaciones). */
function gridFit(width: number, height: number, w: number, h: number) {
  // El redondeo evita perder una pieza por ruido de punto flotante (ej: 20/6.666…).
  const columns = Math.floor(Math.round((width / w) * 1e6) / 1e6);
  const rows = Math.floor(Math.round((height / h) * 1e6) / 1e6);
  return { columns, rows, count: columns * rows };
}

/** ¿Este material admite cargar la medida de una unidad? (madera/papel por superficie) */
export function supportsPieceMode(
  material: Pick<Material, "category" | "measureType">,
) {
  return (
    material.measureType === "area_cm2" &&
    Boolean(material.category && materialSheetBases[material.category])
  );
}

/** Espacio donde se acomodan las piezas: el de trabajo, o la placa entera si no hay. */
export function getWorkArea(material: LayoutMaterial) {
  const base = material.category ? materialSheetBases[material.category] : undefined;
  const baseWidth = base?.widthCm ?? 0;
  const baseHeight = base?.heightCm ?? 0;
  return {
    widthCm: Math.min(material.workArea?.widthCm ?? baseWidth, baseWidth),
    heightCm: Math.min(material.workArea?.heightCm ?? baseHeight, baseHeight),
  };
}

/**
 * Cuántas piezas de `pieceWidthCm × pieceHeightCm` entran en una placa/hoja del
 * material, probando la pieza derecha y girada. Devuelve null si el material no
 * tiene placa base, faltan medidas o la pieza no entra.
 */
export function computePieceLayout(
  material: LayoutMaterial,
  pieceWidthCm: unknown,
  pieceHeightCm: unknown,
): PieceLayout | null {
  if (!supportsPieceMode(material) || !material.category) return null;
  const base = materialSheetBases[material.category];
  const w = positive(pieceWidthCm);
  const h = positive(pieceHeightCm);
  if (!base || !w || !h) return null;

  const { widthCm: workWidthCm, heightCm: workHeightCm } = getWorkArea(material);
  const sheetAreaCm2 = base.widthCm * base.heightCm;

  const straight = gridFit(workWidthCm, workHeightCm, w, h);
  const turned = gridFit(workWidthCm, workHeightCm, h, w);
  const rotated = turned.count > straight.count;
  const best = rotated ? turned : straight;
  if (best.count < 1) return null;

  const usedPercent = Math.min(((best.count * w * h) / sheetAreaCm2) * 100, 100);
  return {
    perSheet: best.count,
    workWidthCm,
    workHeightCm,
    sheetAreaCm2,
    usedPercent,
    wastePercent: 100 - usedPercent,
    rotated,
    columns: best.columns,
    rows: best.rows,
  };
}

/** ¿Hay medidas de pieza cargadas pero no entran en la placa? */
export function pieceDoesNotFit(
  material: LayoutMaterial,
  pieceWidthCm: unknown,
  pieceHeightCm: unknown,
) {
  return (
    supportsPieceMode(material) &&
    positive(pieceWidthCm) > 0 &&
    positive(pieceHeightCm) > 0 &&
    computePieceLayout(material, pieceWidthCm, pieceHeightCm) === null
  );
}
