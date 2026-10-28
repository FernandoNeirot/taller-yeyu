import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/features/admin/services/auth";
import { MaterialManager } from "@/features/materials/components/material-manager";
import { getMaterialCatalog } from "@/features/materials/services/materials";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Materiales",
  robots: { index: false, follow: false },
};

export default async function AdminMaterialsPage() {
  await requireAdmin();
  const materials = await getMaterialCatalog();

  return (
    <main className="min-h-screen px-container-margin py-xl max-w-6xl mx-auto">
      <div className="flex flex-col gap-sm mb-lg">
        <div className="flex flex-wrap items-center gap-md">
          <Link
            href="/admin"
            className="text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            ← Volver al panel
          </Link>
          <Link
            href="/"
            className="text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            Ver sitio
          </Link>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Materiales
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Costos de los materiales del taller. Los usan el cotizador y el costo de
          cada producto.
        </p>
      </div>

      <MaterialManager materials={materials} />
    </main>
  );
}
