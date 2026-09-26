import {
  FieldValue,
  type CollectionReference,
  type QuerySnapshot,
} from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { initialProducts } from "@/data/initialProducts";
import {
  PRODUCTS_COLLECTION,
  getAdminFirestore,
} from "@/lib/firebase-admin";
import { catalogCategories, type Product } from "@/types/product";
import type { ProductInput } from "../types";
import { mapCatalogDoc } from "./map-catalog-product";
import {
  getCachedProducts,
  getStaleCachedProducts,
  isProductCacheFresh,
  peekCachedProduct,
  removeCachedProduct,
  replaceProductCache,
  upsertCachedProduct,
} from "./product-cache";
import { deleteProductImages } from "./upload-product-images";

const catalogCategoryIds = new Set<string>(
  catalogCategories.map((item) => item.id),
);

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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

function revalidateCatalog() {
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
      heightCm: input.heightCm ?? undefined,
      widthCm: input.widthCm ?? undefined,
      depthCm: input.depthCm ?? undefined,
      diameterCm: input.diameterCm ?? undefined,
      finish: input.finish.trim(),
      customizable: input.customizable,
    },
    featuredImage: galleryImages[0] ?? "/principal.png",
    galleryImages,
    price: input.price,
    quantityPrices: input.quantityPrices?.length ? input.quantityPrices : null,
    variants: input.variants?.length ? input.variants : null,
    costQuote: input.costQuote
      ? (JSON.parse(JSON.stringify(input.costQuote)) as typeof input.costQuote)
      : null,
    isActive: input.isActive,
    available: input.isActive,
    dimensions:
      input.heightCm &&
      (input.widthCm || input.diameterCm) &&
      (input.depthCm || input.diameterCm || input.widthCm)
        ? {
            heightCm: input.heightCm,
            widthCm: input.widthCm ?? input.diameterCm ?? input.heightCm,
            lengthCm:
              input.depthCm ?? input.diameterCm ?? input.widthCm ?? input.heightCm,
          }
        : undefined,
  };
}

function mapSnapshotProducts(snapshot: QuerySnapshot): Product[] {
  return snapshot.docs
    .map((doc) => mapCatalogDoc(doc.id, doc.data()))
    .filter((product): product is Product => product !== null)
    .sort((a, b) => a.title.localeCompare(b.title, "es"));
}

function toSeedDoc(product: Product) {
  return {
    slug: product.slug,
    title: product.title,
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    categories: product.categories,
    topics: product.topics,
    specifications: product.specifications,
    featuredImage: product.featuredImage,
    galleryImages: product.galleryImages,
    price: product.price ?? null,
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

async function addMissingSeedProducts(
  collection: CollectionReference,
  snapshot: QuerySnapshot,
) {
  const existing = new Set(snapshot.docs.map((doc) => doc.id));
  const missing = initialProducts.filter((product) => !existing.has(product.slug));
  if (missing.length === 0) return false;

  const batch = getAdminFirestore().batch();
  for (const product of missing) {
    batch.set(collection.doc(product.slug), toSeedDoc(product));
  }
  await batch.commit();
  return true;
}

async function loadProductsFromFirebase(): Promise<Product[]> {
  const collection = getAdminFirestore().collection(PRODUCTS_COLLECTION);
  let snapshot = await collection.get();
  const hasCatalog = snapshot.docs.some((doc) =>
    Array.isArray(doc.data().categories),
  );

  if (!hasCatalog) {
    await seedCatalog(collection);
    snapshot = await collection.get();
  } else if (await addMissingSeedProducts(collection, snapshot)) {
    snapshot = await collection.get();
  }

  replaceProductCache(mapSnapshotProducts(snapshot));
  return getCachedProducts() ?? [];
}

let inflightProducts: Promise<Product[]> | null = null;

export async function getProducts(): Promise<Product[]> {
  const cached = getCachedProducts();
  if (cached) return cached;

  if (!inflightProducts) {
    inflightProducts = loadProductsFromFirebase()
      .catch((error) => {
        console.error("No se pudieron leer los productos de Firestore.", error);
        return getStaleCachedProducts() ?? [];
      })
      .finally(() => {
        inflightProducts = null;
      });
  }

  return inflightProducts;
}

async function getProductForMutation(id: string) {
  const cached = peekCachedProduct(id);
  if (cached) return cached;

  const existing = await getAdminFirestore()
    .collection(PRODUCTS_COLLECTION)
    .doc(id)
    .get();

  if (!existing.exists) return null;
  return mapCatalogDoc(id, existing.data() ?? {});
}

export async function createProduct(input: ProductInput, images: string[]) {
  const payload = toFirestorePayload(input, images);
  if (!payload.slug) {
    throw new Error("El título no es válido.");
  }

  if (peekCachedProduct(payload.slug)) {
    throw new Error("Ya existe un producto con ese título.");
  }

  const collection = getAdminFirestore().collection(PRODUCTS_COLLECTION);

  if (!isProductCacheFresh()) {
    const existing = await collection.doc(payload.slug).get();
    if (existing.exists) {
      throw new Error("Ya existe un producto con ese título.");
    }
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
    quantityPrices: payload.quantityPrices ?? undefined,
    variants: payload.variants ?? undefined,
    costQuote: payload.costQuote ?? undefined,
    createdAt: new Date().toISOString(),
  } satisfies Product;

  upsertCachedProduct(product);
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

  await getAdminFirestore().collection(PRODUCTS_COLLECTION).doc(id).update({
    ...payload,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const product = {
    id,
    ...payload,
    price: payload.price ?? undefined,
    quantityPrices: payload.quantityPrices ?? undefined,
    variants: payload.variants ?? undefined,
    costQuote: payload.costQuote ?? undefined,
    createdAt: current.createdAt,
  } satisfies Product;

  upsertCachedProduct(product);
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
  upsertCachedProduct(product);
  revalidateCatalog();
  return product;
}

export async function deleteProduct(id: string) {
  const current = await getProductForMutation(id);
  if (!current) {
    throw new Error("El producto no existe.");
  }

  await deleteProductImages(current.galleryImages);
  await getAdminFirestore().collection(PRODUCTS_COLLECTION).doc(id).delete();
  removeCachedProduct(id);
  revalidateCatalog();

  return id;
}
