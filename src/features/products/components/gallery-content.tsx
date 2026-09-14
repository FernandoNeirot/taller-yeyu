"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { filterCatalogProducts } from "../lib/filter-catalog";
import { galleryHref, parseGalleryCategory } from "../lib/gallery-url";
import type { Product } from "@/types/product";
import type { GalleryCategoryId } from "@/types/product";
import { GalleryFilters } from "./gallery-filters";
import { ProductCard } from "./product-card";

type GalleryContentProps = {
  products: Product[];
};

export function GalleryContent({ products }: GalleryContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = parseGalleryCategory(searchParams.get("categoria"));
  const selectedTopic = searchParams.get("topic") ?? "";
  const selectedProduct = searchParams.get("producto") ?? "";

  const scopedProducts = useMemo(() => {
    return products.filter((product) => {
      if (!product.isActive) return false;
      if (
        selectedCategory !== "todos" &&
        !product.categories.includes(selectedCategory)
      ) {
        return false;
      }
      if (selectedTopic && !product.topics.includes(selectedTopic)) {
        return false;
      }
      return true;
    });
  }, [products, selectedCategory, selectedTopic]);

  const topics = useMemo(() => {
    const inCategory =
      selectedCategory === "todos"
        ? products
        : products.filter((product) =>
            product.categories.includes(selectedCategory),
          );

    return Array.from(
      new Set(inCategory.flatMap((product) => product.topics)),
    ).sort((a, b) => a.localeCompare(b, "es"));
  }, [products, selectedCategory]);

  const productOptions = useMemo(
    () =>
      [...scopedProducts]
        .sort((a, b) => a.title.localeCompare(b.title, "es"))
        .map((product) => ({
          value: product.id ?? product.slug,
          label: product.title,
        })),
    [scopedProducts],
  );

  const visibleProducts = useMemo(
    () =>
      filterCatalogProducts(products, {
        selectedCategory,
        selectedTopic,
        selectedProduct,
      }),
    [products, selectedCategory, selectedProduct, selectedTopic],
  );

  function handleCategoryChange(category: GalleryCategoryId) {
    router.replace(galleryHref({ categoria: category }), { scroll: false });
  }

  function handleTopicChange(topic: string) {
    router.replace(
      galleryHref({ categoria: selectedCategory, topic }),
      { scroll: false },
    );
  }

  function handleProductChange(product: string) {
    router.replace(
      galleryHref({
        categoria: selectedCategory,
        topic: selectedTopic,
        producto: product,
      }),
      { scroll: false },
    );
  }

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto">
      <section
        className="px-container-margin py-lg flex flex-col gap-sm"
        style={{ paddingTop: "7rem" }}
      >
        <h1 className="font-headline-xl text-headline-xl text-primary">
          Galería de Creaciones
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Inspiración y arte en cada pieza personalizada.
        </p>
      </section>

      <GalleryFilters
        selectedCategory={selectedCategory}
        selectedProduct={selectedProduct}
        selectedTopic={selectedTopic}
        products={productOptions}
        topics={topics}
        visibleCount={visibleProducts.length}
        onCategoryChange={handleCategoryChange}
        onProductChange={handleProductChange}
        onTopicChange={handleTopicChange}
      />

      <section className="px-container-margin pb-xl">
        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-md">
            {visibleProducts.map((product, index) => (
              <ProductCard
                key={product.id ?? product.slug}
                product={product}
                priority={index < 4}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low px-lg py-xl text-center">
            <p className="font-headline-md text-headline-md text-on-surface">
              No encontramos piezas con esa búsqueda
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant mt-sm">
              Probá con otra categoría, temática o producto.
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
