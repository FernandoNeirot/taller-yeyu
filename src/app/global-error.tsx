"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#131313] text-[#e5e2e1]">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-2xl font-semibold">No se pudo cargar esta página</h1>
          <p className="max-w-md text-sm text-[#dac1b8]">
            Recargá o volvé al inicio. Si acabás de publicar un deploy, cerrá la
            pestaña y abrí el sitio de nuevo.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-lg bg-[#a0522d] px-4 py-3 text-xs tracking-widest text-white uppercase"
            >
              Reintentar
            </button>
            <a
              href="/"
              className="rounded-lg border border-[#54433c] px-4 py-3 text-xs tracking-widest uppercase"
            >
              Ir al inicio
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
