import {
  FieldValue,
  type CollectionReference,
  type QuerySnapshot,
} from "firebase-admin/firestore";
import { revalidatePath, unstable_cache, updateTag } from "next/cache";
import { initialProducts } from "@/data/initialProducts";
import {
  PRODUCTS_COLLECTION,
  getAdminFirestore,
} from "@/lib/firebase-admin";
import { catalogCategories, type Product } from "@/types/product";
import type { ProductInput } from "../types";
import { normalizePackOptions } from "../lib/packs";
import { slugify } from "../lib/slug";
import { mapCatalogDoc } from "./map-catalog-product";
import { deleteProductImages } from "./upload-product-images";

const catalogCategoryIds = new Set<string>(
  catalogCategories.map((item) => item.id),
);

export { slugify };

export function parseTopicList(value: string) {
  return [
    ...new Set(
      value
        .split(/[,\n]/)
        .map((item) => slugify(item))
        .filter(Boolean),
    ),
  ];
}

export function isCatalogCategory(value: unknown): value is string {
  return typeof value === "string" && catalogCategoryIds.has(value);
}

/** Etiqueta de la caché de Next que comparten todas las lecturas del catálogo. */
export const PRODUCTS_CACHE_TAG = "products";

/** Red de seguridad por si Firestore se edita por fuera de la app. */
const PRODUCTS_CACHE_REVALIDATE_SECONDS = 60 * 60;

/**
 * Invalida la caché del catálogo y las páginas que lo muestran.
 * Solo se llama desde Server Actions, tras una mutación exitosa.
 */
function revalidateCatalog() {
  updateTag(PRODUCTS_CACHE_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/galeria");
  revalidatePath("/producto", "layout");
  revalidatePath("/admin/productos");
}

function toFirestorePayload(input: ProductInput, images: string[]) {
  const title = input.title.trim();
  const fullDescription = input.fullDescription.trim();
  const shortDescription = input.shortDescription.trim() || fullDescription;
  const galleryImages = images.filter(Boolean);
  const categories = input.categories.filter(isCatalogCategory);
  const packOptions = normalizePackOptions(input.packOptions) ?? [];
  const hasPacks = packOptions.length > 0;
  const measures = {
    ...(input.heightCm != null ? { heightCm: input.heightCm } : {}),
    ...(input.widthCm != null ? { widthCm: input.widthCm } : {}),
    ...(input.depthCm != null ? { depthCm: input.depthCm } : {}),
    ...(input.diameterCm != null ? { diameterCm: input.diameterCm } : {}),
  };
  const packageSize =
    input.heightCm &&
    (input.widthCm || input.diameterCm) &&
    (input.depthCm || input.diameterCm || input.widthCm)
      ? {
          heightCm: input.heightCm,
          widthCm: input.widthCm ?? input.diameterCm ?? input.heightCm,
          lengthCm:
            input.depthCm ?? input.diameterCm ?? input.widthCm ?? input.heightCm,
        }
      : null;

  return {
    slug: slugify(title),
    title,
    shortDescription,
    fullDescription,
    categories,
    topics: input.topics.map(slugify).filter(Boolean),
    specifications: {
      material: "",
      dimensions: input.dimensions.trim(),
      ...measures,
      finish: input.finish.trim(),
      thickness: input.thickness.trim(),
      hasLighting: input.hasLighting,
      powerSource: input.powerSource,
      customizable: input.customizable,
    },
    featuredImage: galleryImages[0] ?? "/principal.png",
    galleryImages,
    // Con packs, el precio base es el del pack más chico y no hay precios
    // por cantidad ni variantes: los packs son la única forma de compra.
    price: hasPacks ? packOptions[0].price : input.price,
    packOptions: hasPacks ? packOptions : null,
    quantityPrices:
      !hasPacks && input.quantityPrices?.length ? input.quantityPrices : null,
    variants: !hasPacks && input.variants?.length ? input.variants : null,
    costQuote: input.costQuote
      ? (JSON.parse(JSON.stringify(input.costQuote)) as typeof input.costQuote)
      : null,
    isActive: input.isActive,
    available: input.isActive,
    dimensions: packageSize,
  };
}

function mapSnapshotProducts(snapshot: QuerySnapshot): Product[] {
  return snapshot.docs
    .map((doc) => mapCatalogDoc(doc.id, doc.data()))
    .filter((product): product is Product => product !== null)
    .sort((a, b) => a.title.localeCompare(b.title, "es"));
}

export function toSeedDoc(product: Product) {
  return {
    slug: product.slug,
    title: product.title,
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    categories: product.categories,
    topics: product.topics,
    specifications: JSON.parse(JSON.stringify(product.specifications)),
    featuredImage: product.featuredImage,
    galleryImages: product.galleryImages,
    price: product.price ?? null,
    packOptions: product.packOptions ?? null,
    quantityPrices: product.quantityPrices ?? null,
    variants: product.variants ?? null,
    costQuote: product.costQuote
      ? (JSON.parse(JSON.stringify(product.costQuote)) as typeof product.costQuote)
      : null,
    isActive: product.isActive,
    available: product.isActive,
    weightGrams: product.weightGrams ?? null,
    dimensions: product.dimensions ?? null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

async function seedCatalog(collection: CollectionReference) {
  const batch = getAdminFirestore().batch();

  for (const product of initialProducts) {
    batch.set(collection.doc(product.slug), toSeedDoc(product));
  }

  await batch.commit();
}

const CATALOG_INITIALIZED_ID = "__catalog";

async function markCatalogInitialized(collection: CollectionReference) {
  await collection.doc(CATALOG_INITIALIZED_ID).set(
    {
      initialized: true,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

async function loadProductsFromFirebase(): Promise<Product[]> {
  const collection = getAdminFirestore().collection(PRODUCTS_COLLECTION);
  let snapshot = await collection.get();
  const initialized = snapshot.docs.some(
    (doc) =>
      doc.id === CATALOG_INITIALIZED_ID && doc.data().initialized === true,
  );
  const hasCatalog = snapshot.docs.some(
    (doc) =>
      doc.id !== CATALOG_INITIALIZED_ID && Array.isArray(doc.data().categories),
  );

  if (!initialized && !hasCatalog) {
    await seedCatalog(collection);
    await markCatalogInitialized(collection);
    snapshot = await collection.get();
  } else if (!initialized) {
    await markCatalogInitialized(collection);
  }

  return mapSnapshotProducts(snapshot);
}

/**
 * Lectura cacheada con la Data Cache de Next (compartida entre instancias, a
 * diferencia de una variable de módulo). Se invalida con `revalidateCatalog()`.
 */
const getCachedProducts = unstable_cache(
  loadProductsFromFirebase,
  // Subir la versión descarta lo cacheado con otra forma de producto (ej. costQuote).
  ["catalog-products", "v2"],
  {
    tags: [PRODUCTS_CACHE_TAG],
    revalidate: PRODUCTS_CACHE_REVALIDATE_SECONDS,
  },
);

export async function getProducts(): Promise<Product[]> {
  try {
    return await getCachedProducts();
  } catch (error) {
    console.error("No se pudieron leer los productos de Firestore.", error);
    return [];
  }
}

async function getProductForMutation(id: string) {
  const existing = await getAdminFirestore()
    .collection(PRODUCTS_COLLECTION)
    .doc(id)
    .get();

  if (!existing.exists) return null;
  return mapCatalogDoc(id, existing.data() ?? {});
}

/** ¿Ya hay un producto con este id? Se usa para validar antes de subir fotos. */
export async function productSlugExists(slug: string) {
  if (!slug) return false;
  const doc = await getAdminFirestore()
    .collection(PRODUCTS_COLLECTION)
    .doc(slug)
    .get();
  return doc.exists;
}

export async function createProduct(input: ProductInput, images: string[]) {
  const payload = toFirestorePayload(input, images);
  if (!payload.slug) {
    throw new Error("El título no es válido.");
  }

  const collection = getAdminFirestore().collection(PRODUCTS_COLLECTION);
  const existing = await collection.doc(payload.slug).get();
  if (existing.exists) {
    throw new Error("Ya existe un producto con ese título.");
  }

  await collection.doc(payload.slug).set({
    ...payload,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const product = {
    id: payload.slug,
    ...payload,
    price: payload.price ?? undefined,
    packOptions: payload.packOptions ?? undefined,
    quantityPrices: payload.quantityPrices ?? undefined,
    variants: payload.variants ?? undefined,
    costQuote: payload.costQuote ?? undefined,
    dimensions: payload.dimensions ?? undefined,
    createdAt: new Date().toISOString(),
  } satisfies Product;

  revalidateCatalog();
  return product;
}

export async function updateProduct(
  id: string,
  input: ProductInput,
  images: string[],
) {
  const payload = toFirestorePayload(input, images);
  const current = await getProductForMutation(id);

  if (!current) {
    throw new Error("El producto no existe.");
  }

  // El formulario no edita el material: conservar el que ya tenía el producto.
  payload.specifications.material = current.specifications.material;

  await getAdminFirestore().collection(PRODUCTS_COLLECTION).doc(id).update({
    ...payload,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const product = {
    id,
    ...payload,
    price: payload.price ?? undefined,
    packOptions: payload.packOptions ?? undefined,
    quantityPrices: payload.quantityPrices ?? undefined,
    variants: payload.variants ?? undefined,
    costQuote: payload.costQuote ?? undefined,
    dimensions: payload.dimensions ?? undefined,
    createdAt: current.createdAt,
  } satisfies Product;

  revalidateCatalog();
  return product;
}

export async function setProductActive(id: string, isActive: boolean) {
  const current = await getProductForMutation(id);
  if (!current) {
    throw new Error("El producto no existe.");
  }

  await getAdminFirestore().collection(PRODUCTS_COLLECTION).doc(id).update({
    isActive,
    available: isActive,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const product = { ...current, isActive };
  revalidateCatalog();
  return product;
}

export async function deleteProduct(id: string) {
  const current = await getProductForMutation(id);
  if (!current) {
    throw new Error("El producto no existe.");
  }

  const productRef = getAdminFirestore().collection(PRODUCTS_COLLECTION).doc(id);
  await deleteProductImages(current.galleryImages);
  await productRef.delete();
  const afterDelete = await productRef.get();
  if (afterDelete.exists) {
    throw new Error("No se pudo eliminar el producto de Firebase.");
  }

  revalidateCatalog();

  return id;
}
