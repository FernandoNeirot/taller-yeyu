// Carga los materiales del cotizador en la colección `materials` de Firestore.
//
//   npm run seed:materials
//
// Es idempotente: cada material tiene un id fijo, así que correrlo de nuevo no
// duplica nada (pisa los valores con los de esta lista).
// Los ids tienen que coincidir con los de src/data/initialMaterials.ts, que es lo
// que usan los productos del seed para referenciar sus materiales.
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const COLLECTION = "materials";

type MeasureType = "area_cm2" | "unit" | "time_minutes";

type SeedMaterial = {
  id: string;
  name: string;
  measureType: MeasureType;
  /** Lo que se pagó por el pack/plancha. */
  totalCost: number;
  /** Lo que rinde ese pago (cm², unidades o minutos). */
  totalUnits: number;
};

const materials: SeedMaterial[] = [
  { id: "madera-mdf-3mm-cara-blanca", name: "Madera MDF 3 mm s/cara blanca", measureType: "area_cm2", totalCost: 30000, totalUnits: 47580 },
  { id: "papel-autoadhesivo", name: "Papel autoadhesivo", measureType: "area_cm2", totalCost: 15000, totalUnits: 63000 },
  { id: "papel-vinilo-transparente", name: "Papel vinilo transparente", measureType: "area_cm2", totalCost: 11000, totalUnits: 12600 },
  { id: "fibras", name: "Fibras", measureType: "unit", totalCost: 10000, totalUnits: 10 },
  { id: "temperas-10-colores", name: "Temperas 10 colores", measureType: "unit", totalCost: 10000, totalUnits: 10 },
  { id: "imagenes", name: "Imágenes", measureType: "unit", totalCost: 15000, totalUnits: 50 },
  { id: "soporte-triangulito-pared", name: "Soporte triangulito pared", measureType: "unit", totalCost: 22000, totalUnits: 200 },
  { id: "bolsita-9x20", name: "Bolsita 9x20", measureType: "unit", totalCost: 7000, totalUnits: 100 },
  { id: "luces-alambre-50-cm", name: "Luces alambre 50 cm", measureType: "unit", totalCost: 23000, totalUnits: 20 },
  { id: "maquina-laser", name: "Máquina láser", measureType: "time_minutes", totalCost: 6000, totalUnits: 60 },
];

function getDb() {
  if (getApps().length === 0) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Faltan NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL o FIREBASE_PRIVATE_KEY en el entorno.",
      );
    }

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId,
    });
  }

  return getFirestore();
}

async function main() {
  const db = getDb();
  const batch = db.batch();

  for (const { id, ...material } of materials) {
    const costPerUnit = material.totalCost / material.totalUnits;

    batch.set(
      db.collection(COLLECTION).doc(id),
      {
        ...material,
        costPerUnit,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    console.log(`+ ${material.name}: $${costPerUnit.toFixed(4)} por unidad`);
  }

  await batch.commit();

  const count = await db.collection(COLLECTION).count().get();
  console.log(
    `✔ Seed completado: ${materials.length} materiales cargados. ` +
      `La colección "${COLLECTION}" tiene ${count.data().count} documentos.`,
  );
}

main().catch((error) => {
  console.error("✖ No se pudo completar el seed de materiales.", error);
  process.exit(1);
});
