"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-headline-md text-headline-md text-on-surface">
        No se pudo cargar esta página
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant">
        Recargá o volvé al inicio. Si acabás de publicar un deploy, cerrá la pestaña
        y abrí el sitio de nuevo.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-primary-container px-4 py-3 font-label-caps text-label-caps tracking-widest text-white uppercase"
        >
          Reintentar
        </button>
        <a
          href="/"
          className="rounded-lg border border-outline-variant/40 px-4 py-3 font-label-caps text-label-caps tracking-widest text-on-surface uppercase"
        >
          Ir al inicio
        </a>
      </div>
    </main>
  );
}
