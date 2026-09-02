import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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
  });
}

export function getAdminFirestore() {
  return getFirestore(getFirebaseAdminApp());
}

export const PRODUCTS_COLLECTION = "talleryeu-productos";
