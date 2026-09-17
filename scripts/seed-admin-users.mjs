import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const scrypt = promisify(scryptCallback);
const COLLECTION = "taller-yeyu-admin-usuarios";
const USERS = ["elizabeth", "fernando"];

function getPrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) {
    throw new Error("Falta FIREBASE_PRIVATE_KEY en el entorno.");
  }
  return key.replace(/\\n/g, "\n");
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64);
  return { salt, passwordHash: hash.toString("hex") };
}

function getApp() {
  if (getApps().length > 0) return getApps()[0];

  return initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: getPrivateKey(),
    }),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

async function main() {
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!password) {
    throw new Error("Definí ADMIN_BOOTSTRAP_PASSWORD para crear los usuarios.");
  }

  const db = getFirestore(getApp());

  for (const username of USERS) {
    const { salt, passwordHash } = await hashPassword(password);
    await db.collection(COLLECTION).doc(username).set(
      {
        username,
        salt,
        passwordHash,
        active: true,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    console.log(`Usuario actualizado: ${username}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
