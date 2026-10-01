export function timestampMillis(value: unknown) {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (
    typeof value === "object" &&
    "toMillis" in value &&
    typeof value.toMillis === "function"
  ) {
    return value.toMillis();
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function compareNewestCreated(
  a: { id: string; date: string; createdAtMs: number },
  b: { id: string; date: string; createdAtMs: number },
) {
  const createdDelta = b.createdAtMs - a.createdAtMs;
  if (createdDelta !== 0) return createdDelta;
  const dateDelta = b.date.localeCompare(a.date);
  if (dateDelta !== 0) return dateDelta;
  return b.id.localeCompare(a.id);
}
