// Elimina el costQuote con el formato anterior (maderas, máquina, mano de obra,
// accesorios) de los productos en Firestore. Los que ya usan `items` no se tocan.
//
//   node --env-file=.env scripts/clean-legacy-cost-quotes.mjs --dry-run   solo lista
//   node --env-file=.env scripts/clean-legacy-cost-quotes.mjs             los elimina
import { FieldValue } from "firebase-admin/firestore";
import { getDb, parseSeedFlags } from "./lib/admin-db.mjs";

const COLLECTION = "talleryeu-productos";
const { dryRun } = parseSeedFlags();

const snapshot = await getDb().collection(COLLECTION).get();
const legacy = snapshot.docs.filter((doc) => {
  const quote = doc.data().costQuote;
  if (quote == null) return false;
  return typeof quote !== "object" || !Array.isArray(quote.items);
});

for (const doc of legacy) {
  const total = doc.data().costQuote?.totalAmount;
  console.log(`${dryRun ? "[dry-run] " : ""}${doc.id}${total ? ` (costo $${total})` : ""}`);
  if (!dryRun) {
    await doc.ref.update({
      costQuote: null,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

console.log(
  `${dryRun ? "[dry-run] " : ""}${legacy.length} de ${snapshot.size} documentos con cotización vieja` +
    (dryRun ? ", no se eliminó nada." : " eliminada."),
);
