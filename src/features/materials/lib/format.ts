export function formatMoney(value: number, maximumFractionDigits = 2) {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits,
  });
}

export function formatNumber(value: number, maximumFractionDigits = 2) {
  return value.toLocaleString("es-AR", { maximumFractionDigits });
}

/** Fecha de última edición (ISO) como "10/11/2026 14:30", en hora de Argentina. */
export function formatEditedAt(iso?: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Convierte un Timestamp de Firestore (o Date) a ISO; undefined si no hay dato. */
export function timestampToIso(value: unknown): string | undefined {
  if (value && typeof value === "object" && "toDate" in value) {
    const date = (value as { toDate: () => Date }).toDate();
    return date.toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  return undefined;
}
