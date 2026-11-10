// Elimina el campo `costQuote` de todos los productos en Firestore: el costo
// ahora vive en las cotizaciones (/admin/cotizador) y se vincula con `quoteId`.
//
//   node --env-file=.env scripts/remove-product-cost-quotes.mjs --dry-run   solo lista
//   node --env-file=.env scripts/remove-product-cost-quotes.mjs             lo elimina
import { FieldValue } from "firebase-admin/firestore";
import { getDb, parseSeedFlags } from "./lib/admin-db.mjs";

const COLLECTION = "talleryeu-productos";
const { dryRun } = parseSeedFlags();

const snapshot = await getDb().collection(COLLECTION).get();
const withQuote = snapshot.docs.filter((doc) => "costQuote" in doc.data());

for (const doc of withQuote) {
  console.log(`${dryRun ? "[dry-run] " : ""}${doc.id}`);
  if (!dryRun) {
    await doc.ref.update({
      costQuote: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

console.log(
  `${dryRun ? "[dry-run] " : ""}${withQuote.length} de ${snapshot.size} productos con costQuote` +
    (dryRun ? ", no se tocó nada." : ": campo eliminado."),
);
