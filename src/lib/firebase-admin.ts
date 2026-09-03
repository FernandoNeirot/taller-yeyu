import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function getPrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) {
    throw new Error("Falta FIREBASE_PRIVATE_KEY en el entorno.");
  }

  return key.replace(/\\n/g, "\n");
}

export function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!clientEmail || !projectId) {
    throw new Error("Faltan credenciales de Firebase Admin en el entorno.");
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: getPrivateKey(),
    }),
    projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export function getAdminFirestore() {
  return getFirestore(getFirebaseAdminApp());
}

export function getAdminBucket() {
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error("Falta NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET en el entorno.");
  }

  return getStorage(getFirebaseAdminApp()).bucket(bucketName);
}

export const PRODUCTS_COLLECTION = "talleryeu-productos";
export const FAMILY_FINANCE_COLLECTION = "taller-yeyu-financiero-familiar";
