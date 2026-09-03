import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/features/admin/services/auth";
import { getMaterials } from "@/features/finance/services/venture-finance";
import { QuoteBuilder } from "@/features/quotes/components/quote-builder";
import { getQuotes } from "@/features/quotes/services/quotes";

export const metadata: Metadata = {
  title: "Cotizador",
  robots: { index: false, follow: false },
};

export default async function AdminQuotesPage() {
  await requireAdmin();
  const [materials, quotes] = await Promise.all([getMaterials(), getQuotes()]);

  return (
    <main className="min-h-screen px-container-margin py-xl max-w-6xl mx-auto">
      <div className="flex flex-col gap-sm mb-lg">
        <Link
          href="/admin"
          className="text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          ← Volver al panel
        </Link>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Cotizador
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Armá un presupuesto con maderas, pinturas y accesorios del catálogo.
        </p>
      </div>

      <QuoteBuilder materials={materials} quotes={quotes} />
    </main>
  );
}
