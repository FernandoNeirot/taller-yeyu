// Carga los juegos didácticos 9x9 (Tateti, Tangram, Rompecabezas, Memotest) en
// el catálogo de Firestore (Firebase Admin). Sirve para catálogos ya inicializados:
// con la colección vacía la app siembra todo initialProducts por su cuenta.
//
//   npm run seed:games                 crea los que faltan, no toca los existentes
//   npm run seed:games -- --force      pisa también los existentes (incluye fotos)
//   npm run seed:games -- --dry-run    solo muestra qué haría
//
// Los datos salen de src/data/didacticGamesSeed.ts (Node 24 ejecuta el .ts directo).
// Ojo: el costo del cotizador usa los materiales de src/data/initialMaterials.ts,
// así que conviene correr antes `npm run seed:materials`.
import { FieldValue } from "firebase-admin/firestore";
import { didacticGameSeeds } from "../src/data/didacticGamesSeed.ts";
import { getDb, parseSeedFlags } from "./lib/admin-db.mjs";

const COLLECTION = "talleryeu-productos";
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/500";
const { dryRun, force } = parseSeedFlags();

/** Mismo documento que arma toSeedDoc() en src/features/products/services/get-products.ts. */
function toDoc(product) {
  return {
    slug: product.slug,
    title: product.title,
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    categories: product.categories,
    topics: product.topics,
    specifications: product.specifications,
    featuredImage: PLACEHOLDER_IMAGE,
    galleryImages: [PLACEHOLDER_IMAGE],
    price: product.price ?? null,
    packOptions: product.packOptions ?? null,
    quantityPrices: null,
    variants: null,
    costQuote: product.costQuote ?? null,
    isActive: true,
    available: true,
    weightGrams: product.weightGrams ?? null,
    dimensions: product.dimensions ?? null,
  };
}

if (dryRun) {
  for (const product of didacticGameSeeds) {
    const packs = product.packOptions
      .map((pack) => `x${pack.quantity} $${pack.price}`)
      .join(" · ");
    console.log(`[dry-run] ${product.slug}: ${packs}`);
    console.log(
      `          costo unitario $${product.costQuote?.totalAmount} (${product.costQuote?.items.length} materiales)`,
    );
  }
  console.log(`[dry-run] ${didacticGameSeeds.length} productos, no se escribió nada.`);
  process.exit(0);
}

const collection = getDb().collection(COLLECTION);
let created = 0;
let overwritten = 0;
let skipped = 0;

for (const product of didacticGameSeeds) {
  const ref = collection.doc(product.slug);
  const exists = (await ref.get()).exists;

  if (exists && !force) {
    skipped += 1;
    console.log(`= ${product.slug} ya existe (usá --force para pisarlo)`);
    continue;
  }

  const doc = toDoc(product);
  if (exists) {
    // Se conservan las fotos que ya tenga cargadas.
    delete doc.featuredImage;
    delete doc.galleryImages;
    await ref.update({ ...doc, updatedAt: FieldValue.serverTimestamp() });
    overwritten += 1;
  } else {
    await ref.set({
      ...doc,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    created += 1;
  }
  console.log(`${exists ? "~" : "+"} ${product.slug}`);
}

console.log(
  `Listo: ${created} creados, ${overwritten} pisados, ${skipped} salteados. ` +
    "Las páginas se actualizan solas en hasta 1 hora, o guardando cualquier producto desde el admin.",
);
