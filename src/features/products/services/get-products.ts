import { FieldValue, type DocumentData } from "firebase-admin/firestore";
import {
  PRODUCTS_COLLECTION,
  getAdminFirestore,
} from "@/lib/firebase-admin";
import type {
  Product,
  ProductCategory,
  ProductInput,
} from "../types";
import { productCategories, productCategoryLabels } from "../types";

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function isProductCategory(value: unknown): value is ProductCategory {
  return productCategories.includes(value as ProductCategory);
}

function normalizeCategory(value: unknown): ProductCategory {
  if (value === "iluminacion") return "veladores";
  return isProductCategory(value) ? value : "souvenirs";
}

function toNumberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function mapProductDoc(
  id: string,
  data: DocumentData,
): Product {
  const title = String(data.title ?? "");
  const description = String(data.description ?? "");
  const image = String(data.image ?? "");
  const images = Array.isArray(data.images)
    ? data.images.map(String).filter(Boolean)
    : [];
  const gallery = images.length > 0 ? images : image ? [image] : [];

  return {
    id,
    slug: String(data.slug ?? id),
    title,
    description,
    category: normalizeCategory(data.category),
    tag: String(data.tag ?? ""),
    alt: String(data.alt ?? title),
    image: gallery[0] ?? "",
    images: gallery,
    material: String(data.material ?? "Madera"),
    finish: String(data.finish ?? ""),
    customizable: Boolean(data.customizable),
    featured: Boolean(data.featured),
    available: data.available !== false,
    stock: toNumberOrNull(data.stock),
    price: toNumberOrNull(data.price),
    currency: "ARS",
    searchText: String(data.searchText ?? `${title} ${description}`),
    instagramUrl: String(data.instagramUrl ?? ""),
    mercadoLibreUrl: String(data.mercadoLibreUrl ?? ""),
  };
}

export function buildProductPayload(input: ProductInput, images: string[]) {
  const title = input.title.trim();
  const description = input.description.trim();
  const gallery = images.filter(Boolean).slice(0, 3);
  const category = input.category;
  const tag = input.tag.trim() || productCategoryLabels[category];

  return {
    slug: slugify(title),
    title,
    description,
    category,
    tag,
    alt: input.alt.trim() || title,
    image: gallery[0] ?? "",
    images: gallery,
    material: input.material.trim() || "Madera",
    finish: input.finish.trim(),
    customizable: input.customizable,
    featured: input.featured,
    available: input.available,
    stock: input.stock,
    price: input.price,
    currency: "ARS" as const,
    searchText: `${title} ${description} ${tag} ${input.material} ${input.finish}`.toLowerCase(),
    instagramUrl: input.instagramUrl.trim(),
    mercadoLibreUrl: input.mercadoLibreUrl.trim(),
  };
}

export async function getProducts(): Promise<Product[]> {
  let snapshot;

  try {
    snapshot = await getAdminFirestore()
      .collection(PRODUCTS_COLLECTION)
      .orderBy("title")
      .get();
  } catch (error) {
    console.error("No se pudieron leer los productos de Firestore.", error);
    return [];
  }

  return snapshot.docs.map((doc) => mapProductDoc(doc.id, doc.data()));
}

export async function createProduct(input: ProductInput, images: string[]) {
  const payload = buildProductPayload(input, images);
  const docRef = await getAdminFirestore()
    .collection(PRODUCTS_COLLECTION)
    .add({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

  return { id: docRef.id, ...payload } satisfies Product;
}

export async function updateProduct(
  id: string,
  input: ProductInput,
  images: string[],
) {
  const payload = buildProductPayload(input, images);
  const docRef = getAdminFirestore().collection(PRODUCTS_COLLECTION).doc(id);
  const existing = await docRef.get();

  if (!existing.exists) {
    throw new Error("El producto no existe.");
  }

  await docRef.update({
    ...payload,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { id, ...payload } satisfies Product;
}
