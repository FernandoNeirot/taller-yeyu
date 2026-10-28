import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getPrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) {
    throw new Error("Falta FIREBASE_PRIVATE_KEY en el entorno.");
  }
  return key.replace(/\\n/g, "\n");
}

/** Firestore con las credenciales de .env (mismas variables que usa la app). */
export function getDb() {
  if (getApps().length === 0) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    if (!projectId || !clientEmail) {
      throw new Error("Faltan credenciales de Firebase Admin en el entorno.");
    }

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey: getPrivateKey() }),
      projectId,
    });
  }

  return getFirestore();
}

/**
 * Flags comunes de los seeds:
 *  --dry-run  muestra qué se escribiría, sin tocar Firestore (no pide credenciales).
 *  --force    pisa los documentos que ya existen (por defecto se saltean).
 */
export function parseSeedFlags(argv = process.argv.slice(2)) {
  return {
    dryRun: argv.includes("--dry-run"),
    force: argv.includes("--force"),
  };
}
