"use client";

import { useEffect, useMemo, useState } from "react";
import { preguntas, secciones, type Pregunta } from "../data/preguntas";

type Marca = "sabia" | "repasar";

const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

// Orden pseudo-aleatorio determinista segun la semilla (evita Math.random en render).
function hashOrden(id: number, semilla: number) {
  let h = (id * 2654435761 + semilla * 40503) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 2246822519) >>> 0;
  h ^= h >>> 13;
  return h;
}

const indexadas = preguntas.map((p) => ({
  p,
  texto: normalizar(`${p.pregunta} ${p.respuesta} ${p.seccion}`),
}));

export function Simulacro() {
  const [busqueda, setBusqueda] = useState("");
  const [seccion, setSeccion] = useState<string | null>(null);
  const [soloRepasar, setSoloRepasar] = useState(false);
  const [semilla, setSemilla] = useState<number | null>(null);
  const [marcas, setMarcas] = useState<Record<number, Marca>>({});
  const [indice, setIndice] = useState(0);
  const [verRespuesta, setVerRespuesta] = useState(false);

  const lista = useMemo<Pregunta[]>(() => {
    const terminos = normalizar(busqueda).split(/\s+/).filter(Boolean);
    const filtradas = indexadas
      .filter(
        ({ p, texto }) =>
          (!seccion || p.seccion === seccion) &&
          (!soloRepasar || marcas[p.id] === "repasar") &&
          terminos.every((t) => texto.includes(t)),
      )
      .map(({ p }) => p);

    if (semilla !== null) {
      filtradas.sort((a, b) => hashOrden(a.id, semilla) - hashOrden(b.id, semilla));
    }
    return filtradas;
  }, [busqueda, seccion, soloRepasar, semilla, marcas]);

  const total = lista.length;
  const posicion = Math.min(indice, Math.max(total - 1, 0));
  const actual = lista[posicion];

  const irA = (nuevo: number) => {
    if (!total) return;
    setIndice(Math.min(Math.max(nuevo, 0), total - 1));
    setVerRespuesta(false);
  };

  const reiniciarVista = () => {
    setIndice(0);
    setVerRespuesta(false);
  };

  const marcar = (marca: Marca) => {
    if (!actual) return;
    setMarcas((prev) => ({ ...prev, [actual.id]: marca }));
    // En "solo repasar" la pregunta marcada como sabida sale de la lista: no avanzamos.
    if (!(soloRepasar && marca === "sabia")) irA(posicion + 1);
    else setVerRespuesta(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight") irA(posicion + 1);
      if (e.key === "ArrowLeft") irA(posicion - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const cantSabia = Object.values(marcas).filter((m) => m === "sabia").length;
  const cantRepasar = Object.values(marcas).filter((m) => m === "repasar").length;
  const marcaActual = actual ? marcas[actual.id] : undefined;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-5 px-4 py-8 sm:py-12">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-3xl text-on-background">Simulacro de entrevista</h1>
        <p className="text-sm text-on-surface-variant">
          {preguntas.length} preguntas técnicas. Respondé en voz alta y después mirá la respuesta.
        </p>
      </header>

      <section aria-label="Filtros" className="flex flex-col gap-3">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            reiniciarVista();
          }}
          placeholder="Buscar tema: promise, vite, hooks, cors…"
          aria-label="Buscar preguntas"
          className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-base text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />

        <div className="flex flex-wrap gap-2">
          <Chip activo={seccion === null} onClick={() => { setSeccion(null); reiniciarVista(); }}>
            Todas
          </Chip>
          {secciones.map((s) => (
            <Chip
              key={s}
              activo={seccion === s}
              onClick={() => {
                setSeccion(seccion === s ? null : s);
                reiniciarVista();
              }}
            >
              {s.split(".")[0]}
              <span className="hidden sm:inline">
                {" · "}
                {s.slice(s.indexOf(".") + 2)}
              </span>
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Toggle
            activo={semilla !== null}
            onClick={() => {
              setSemilla(semilla === null ? Math.floor(Math.random() * 1e6) + 1 : null);
              reiniciarVista();
            }}
          >
            Orden aleatorio
          </Toggle>
          <Toggle
            activo={soloRepasar}
            onClick={() => {
              setSoloRepasar(!soloRepasar);
              reiniciarVista();
            }}
          >
            Solo para repasar ({cantRepasar})
          </Toggle>
          <span className="ml-auto text-on-surface-variant">
            Sabía: {cantSabia} · Repasar: {cantRepasar}
          </span>
        </div>
      </section>

      {actual ? (
        <article className="flex flex-1 flex-col gap-5 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-3 text-xs text-on-surface-variant">
            <span>
              Pregunta {posicion + 1} de {total}
              <span className="opacity-60"> (#{actual.id})</span>
            </span>
            <span className="rounded-full bg-primary-fixed px-3 py-1 text-on-primary-fixed-variant">
              {actual.seccion}
            </span>
          </div>

          <div
            className="h-1.5 overflow-hidden rounded-full bg-surface-container-high"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={posicion + 1}
          >
            <div
              className="h-full bg-primary transition-[width]"
              style={{ width: `${((posicion + 1) / total) * 100}%` }}
            />
          </div>

          <h2 className="font-serif text-xl leading-snug text-on-surface sm:text-2xl">
            {actual.pregunta}
          </h2>

          {verRespuesta ? (
            <div className="rounded-xl bg-surface-container-low p-4 text-base leading-relaxed text-on-surface">
              {actual.respuesta}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setVerRespuesta(true)}
              className="rounded-xl bg-primary px-5 py-3 text-base font-medium text-on-primary transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              No sé · Mostrar respuesta
            </button>
          )}

          {verRespuesta && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => marcar("sabia")}
                className="flex-1 rounded-xl border border-primary px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary-fixed"
              >
                Lo sabía
              </button>
              <button
                type="button"
                onClick={() => marcar("repasar")}
                className="flex-1 rounded-xl border border-outline px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container"
              >
                Repasar después
              </button>
            </div>
          )}

          {marcaActual && (
            <p className="text-xs text-on-surface-variant">
              Marcada: {marcaActual === "sabia" ? "la sabías" : "para repasar"}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => irA(posicion - 1)}
              disabled={posicion === 0}
              className="rounded-xl border border-outline-variant px-4 py-2 text-sm text-on-surface hover:bg-surface-container disabled:opacity-40"
            >
              ← Anterior
            </button>
            <span className="hidden text-xs text-on-surface-variant sm:inline">
              Podés usar las flechas ← →
            </span>
            <button
              type="button"
              onClick={() => irA(posicion + 1)}
              disabled={posicion >= total - 1}
              className="rounded-xl border border-outline-variant px-4 py-2 text-sm text-on-surface hover:bg-surface-container disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>
        </article>
      ) : (
        <div className="rounded-2xl border border-dashed border-outline-variant p-10 text-center text-on-surface-variant">
          No hay preguntas para ese filtro.
        </div>
      )}
    </div>
  );
}

function Chip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`rounded-full border px-3 py-1 text-xs transition ${
        activo
          ? "border-primary bg-primary text-on-primary"
          : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`rounded-lg border px-3 py-1.5 transition ${
        activo
          ? "border-primary bg-primary-fixed text-on-primary-fixed-variant"
          : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
      }`}
    >
      {children}
    </button>
  );
}
