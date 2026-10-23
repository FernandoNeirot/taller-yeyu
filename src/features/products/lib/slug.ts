/** "Árbol de la Vida 30x30" → "arbol-de-la-vida-30x30". Es el id del producto. */
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
