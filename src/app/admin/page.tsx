import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/features/admin/services/auth";
import { logoutAction } from "@/features/admin/actions/logout-action";
import { MaterialIcon } from "@/components/ui/material-icon";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const modules = [
  {
    title: "Control Financiero",
    description: "Ingresos, egresos y balance general",
    icon: "account_balance",
    href: "/admin/financiero",
    color: "bg-primary-container",
  },
  {
    title: "Productos",
    description: "Gestión del catálogo de productos",
    icon: "inventory_2",
    href: "/admin/productos",
    color: "bg-secondary-container",
  },
  {
    title: "Cotizador",
    description: "Cotizaciones y presupuestos",
    icon: "calculate",
    href: "/admin/cotizador",
    color: "bg-surface-container-highest",
  },
];

export default async function AdminDashboard() {
  const user = await requireAdmin();

  return (
    <main className="min-h-screen px-container-margin py-xl max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-xl">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Panel Admin
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Hola, <span className="capitalize text-primary">{user}</span>
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-sm px-4 py-2 border border-outline-variant/40 text-on-surface-variant font-label-caps text-label-caps tracking-widest rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <MaterialIcon name="logout" className="text-base" />
            Salir
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group flex flex-col items-center gap-md p-lg rounded-xl border border-outline-variant/20 bg-surface-container hover:bg-surface-container-high transition-all duration-300 hover:border-primary/30"
          >
            <div
              className={`w-16 h-16 ${mod.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
            >
              <MaterialIcon
                name={mod.icon}
                className="text-3xl text-on-surface"
              />
            </div>
            <div className="text-center">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                {mod.title}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                {mod.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
