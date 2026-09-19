import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-container-margin text-center">
      <h1 className="font-headline-lg text-headline-lg text-on-surface">
        No encontramos esa pieza
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant">
        Puede que ya no esté en el catálogo. Recorré la galería para ver las
        piezas disponibles.
      </p>
      <Link
        href="/galeria"
        className="touch-target inline-flex items-center justify-center rounded-lg bg-primary-container px-4 font-label-caps text-label-caps tracking-widest text-white uppercase"
      >
        Ir a la galería
      </Link>
    </main>
  );
}
