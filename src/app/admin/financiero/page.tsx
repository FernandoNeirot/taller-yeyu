import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/features/admin/services/auth";
import { FinancialControl } from "@/features/admin/components/financial-control";
import { getFamilyFinanceEntries } from "@/features/finance/services/family-finance";

export const metadata: Metadata = {
  title: "Control Financiero",
  robots: { index: false, follow: false },
};

export default async function AdminFinancialPage() {
  await requireAdmin();
  const familyEntries = await getFamilyFinanceEntries();

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
          Control Financiero
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Registrá movimientos familiares y del emprendimiento en un solo lugar.
        </p>
      </div>

      <FinancialControl familyEntries={familyEntries} />
    </main>
  );
}
