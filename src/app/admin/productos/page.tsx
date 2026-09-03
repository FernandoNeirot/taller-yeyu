import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/features/admin/services/auth";
import { ProductManager } from "@/features/products/components/product-manager";
import { getProducts } from "@/features/products/services/get-products";

export const metadata: Metadata = {
  title: "Productos",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await getProducts();

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
          Productos
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Creá y editá el catálogo. Las fotos se guardan en Firebase Storage.
        </p>
      </div>

      <ProductManager products={products} />
    </main>
  );
}
