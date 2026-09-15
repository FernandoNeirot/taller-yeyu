"use client";

export type GalleryViewMode = "grid" | "list";

type ViewToggleProps = {
  viewMode: GalleryViewMode;
  setViewMode: (mode: GalleryViewMode) => void;
};

export function ViewToggle({ viewMode, setViewMode }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center rounded-xl border border-zinc-800 bg-zinc-900 p-1">
      <button
        type="button"
        onClick={() => setViewMode("grid")}
        className={
          viewMode === "grid"
            ? "rounded-lg bg-zinc-800 p-2 text-white shadow-sm"
            : "rounded-lg p-2 text-zinc-400 hover:text-white"
        }
        aria-label="Vista en cuadrícula"
        aria-pressed={viewMode === "grid"}
      >
        <svg className="h-4 w-4 fill-current" viewBox="0 0 16 16">
          <path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zM9 2.5A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zM1 10.5A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zM9 10.5A1.5 1.5 0 0110.5 9h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 13.5v-3z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => setViewMode("list")}
        className={
          viewMode === "list"
            ? "rounded-lg bg-zinc-800 p-2 text-white shadow-sm"
            : "rounded-lg p-2 text-zinc-400 hover:text-white"
        }
        aria-label="Vista en lista"
        aria-pressed={viewMode === "list"}
      >
        <svg className="h-4 w-4 fill-current" viewBox="0 0 16 16">
          <path d="M2 3.75A.75.75 0 012.75 3h10.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zm0 4.25a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H2.75A.75.75 0 012 8zm0 4.25a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" />
        </svg>
      </button>
    </div>
  );
}
