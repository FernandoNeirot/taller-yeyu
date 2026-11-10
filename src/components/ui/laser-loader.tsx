const HEART_PATH =
  "M50 82 C20 60 12 42 12 32 C12 20 22 13 32 13 C40 13 46 18 50 25 C54 18 60 13 68 13 C78 13 88 20 88 32 C88 42 80 60 50 82 Z";

type LaserLoaderProps = {
  /** Texto visible debajo de la animación. */
  label?: string;
  /** Ocupa toda la pantalla (para cargas de página). Por defecto solo centra en su contenedor. */
  fullScreen?: boolean;
};

/**
 * Loader con la temática del taller: un láser corta un corazón sobre una
 * tablita de madera. Solo CSS/SVG, sin JavaScript en el cliente.
 */
export function LaserLoader({
  label = "Cortando tu pedido…",
  fullScreen = false,
}: LaserLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-md ${
        fullScreen ? "min-h-dvh" : "min-h-64 py-xl"
      }`}
    >
      <svg
        viewBox="0 0 100 100"
        width="128"
        height="128"
        aria-hidden="true"
        className="drop-shadow-sm"
      >
        <defs>
          <linearGradient id="laser-wood" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-primary-fixed)" />
            <stop offset="100%" stopColor="var(--color-secondary-fixed-dim)" />
          </linearGradient>
        </defs>

        {/* Tablita de madera con vetas */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="10"
          fill="url(#laser-wood)"
          stroke="var(--color-primary-fixed-dim)"
          strokeWidth="1.5"
        />
        <g
          stroke="var(--color-primary-container)"
          strokeOpacity="0.18"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        >
          <path d="M10 22 C34 18 62 26 90 20" />
          <path d="M10 40 C36 36 64 44 90 38" />
          <path d="M10 62 C32 66 66 56 90 62" />
          <path d="M10 80 C38 76 60 84 90 78" />
        </g>

        {/* Corte ya hecho */}
        <path
          d={HEART_PATH}
          fill="none"
          stroke="var(--color-primary)"
          strokeOpacity="0.15"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <g className="laser-cut-group">
          {/* Línea quemada por el láser */}
          <path
            d={HEART_PATH}
            pathLength={100}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="laser-cut-line"
          />
          {/* Chispa del láser */}
          <g className="laser-spark">
            <circle r="6" fill="#ff5a36" fillOpacity="0.28" />
            <circle r="3" fill="#ff5a36" />
            <circle r="1.2" fill="#fff4ee" />
          </g>
        </g>
      </svg>

      <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
        {label}
      </p>
    </div>
  );
}
