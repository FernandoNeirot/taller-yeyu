"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import type { ProductCategory } from "../types";
import { useProducts } from "../hooks/use-products";

const filters = [
  { id: "todos", label: "Todos" },
  { id: "iluminacion", label: "Iluminación" },
  { id: "kits", label: "Kits" },
  { id: "souvenirs", label: "Souvenirs" },
] as const;

type FilterId = (typeof filters)[number]["id"];

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

export function GalleryContent() {
  const { data: products = [] } = useProducts();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("todos");

  const visibleProducts = useMemo(() => {
    const term = normalize(query);

    return products.filter((product) => {
      const matchesFilter =
        filter === "todos" || product.category === (filter as ProductCategory);
      if (!matchesFilter) {
        return false;
      }

      if (!term) {
        return true;
      }

      const haystack = normalize(
        `${product.title} ${product.description} ${product.tag} ${product.material} ${product.finish} ${product.searchText}`,
      );
      return haystack.includes(term);
    });
  }, [filter, products, query]);

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto">
      <section className="px-container-margin py-lg flex flex-col gap-sm">
        <h1 className="font-headline-xl text-headline-xl text-primary">
          Galería de Creaciones
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Inspiración y arte en cada pieza personalizada.
        </p>
      </section>

      <section className="px-container-margin pb-md flex flex-col gap-md">
        <label className="relative block">
          <span className="sr-only">Buscar productos</span>
          <MaterialIcon
            name="search"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, categoría o detalle..."
            className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low py-3 pl-12 pr-4 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/70 outline-none transition-colors focus:border-primary"
          />
        </label>

        <div className="overflow-x-auto whitespace-nowrap hide-scrollbar flex items-center gap-sm">
          {filters.map((item) => {
            const active = item.id === filter;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={
                  active
                    ? "px-4 py-2 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps transition-colors"
                    : "px-4 py-2 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant font-label-caps text-label-caps hover:bg-surface-container-high transition-colors"
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-container-margin pb-xl">
        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-md">
            {visibleProducts.map((product, index) => (
              <article
                key={product.id}
                className="h-full flex flex-col overflow-hidden rounded-xl bg-surface-container border border-outline-variant/20"
              >
                <div className="relative aspect-square w-full shrink-0">
                  <Image
                    alt={product.alt}
                    src={product.image}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
                    unoptimized
                    priority={index < 4}
                  />
                </div>
                <div className="flex flex-1 flex-col p-3 bg-surface-container-high">
                  <h4 className="font-label-caps text-label-caps text-secondary tracking-widest">
                    {product.tag}
                  </h4>
                  <h3 className="font-headline-md text-headline-md text-on-surface mt-1 leading-tight line-clamp-2 min-h-16">
                    {product.title}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1 line-clamp-2">
                    {product.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low px-lg py-xl text-center">
            <p className="font-headline-md text-headline-md text-on-surface">
              No encontramos piezas con esa búsqueda
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant mt-sm">
              Probá con otro nombre, como velador, kit o souvenir.
            </p>
          </div>
        )}
      </section>

      <section className="px-container-margin pb-xl">
        <div className="bg-surface-container-highest rounded-xl p-6 text-center border border-outline-variant/50">
          <MaterialIcon
            name="handyman"
            className="text-primary text-4xl mb-2"
          />
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
            ¿Tienes una idea?
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Convertimos tus conceptos en piezas únicas de madera cortada con
            precisión láser.
          </p>
          <Link
            href="/#contacto"
            className="inline-flex w-full items-center justify-center py-4 rounded bg-primary text-on-primary font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary-fixed transition-colors"
          >
            Hacer un Pedido Especial
          </Link>
        </div>
      </section>
    </div>
  );
}
