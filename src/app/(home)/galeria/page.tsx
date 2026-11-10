import { Suspense } from "react";
import { getCatalogProducts } from "@/features/products/services/get-catalog-products";
import { ProductCard } from "@/features/products/components/product-card";
import { GalleryContent } from "@/features/products/components/gallery-content";
import { JsonLd, getGalleryJsonLd } from "@/lib/seo/json-ld";
import { sharePageMetadata } from "@/lib/seo/metadata";

const galleryDescription =
  "Inspiración y arte en cada pieza personalizada de Taller Yeyu.";

export const revalidate = 300;

export const metadata = sharePageMetadata({
  title: "Galería",
  description: galleryDescription,
  path: "/galeria",
});

export default async function GaleriaPage() {
  const products = await getCatalogProducts();

  return (
    <main id="contenido" className="w-full">
      <JsonLd
        data={getGalleryJsonLd(
          products.map((product) => ({
            title: product.title,
            description: product.shortDescription,
            image: product.featuredImage,
            slug: product.slug,
          })),
        )}
      />
      <Suspense
        // GalleryContent lee los filtros de la URL en el cliente, así que el HTML
        // inicial es este fallback: lleva el título y los enlaces reales a cada
        // producto para que Google (y cualquier lector sin JS) los pueda rastrear.
        fallback={
          <div className="flex w-full max-w-7xl mx-auto flex-col">
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
            <section className="px-container-margin pb-xl">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id ?? product.slug}
                    product={product}
                    viewMode="grid"
                    priority={index < 2}
                  />
                ))}
              </div>
            </section>
          </div>
        }
      >
        <GalleryContent products={products} />
      </Suspense>
    </main>
  );
}
