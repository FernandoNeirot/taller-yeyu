import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/features/admin/services/auth";
import { LoginForm } from "@/features/admin/components/login-form";
import { Logo } from "@/components/layout/logo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const user = await getSession();
  if (user) redirect("/admin");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div style={{ width: "100%", maxWidth: "448px" }} className="bg-surface-container rounded-2xl border border-outline-variant/20 p-8 flex flex-col items-center gap-lg">
        <Link href="/" aria-label="Taller Yeyu, ir al inicio">
          <Logo alt="" className="h-20 w-auto" />
        </Link>
        <h1 className="font-headline-md text-headline-md text-on-surface text-center">
          Panel de Administración
        </h1>
        <LoginForm />
        <Link
          href="/"
          className="text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          Volver al sitio
        </Link>
      </div>
    </main>
  );
}
