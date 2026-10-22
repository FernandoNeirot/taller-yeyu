import { FeaturedCategoryBannerCarousel } from "@/components/home/FeaturedCategoryBannerCarousel";
import { FeaturedCategoryGrid } from "@/components/home/FeaturedCategoryGrid";
import { FeaturedCategoryHero } from "@/components/home/FeaturedCategoryHero";
import { FeaturedCategorySlim } from "@/components/home/FeaturedCategorySlim";
import { getCatalogProducts } from "@/features/products/services/get-catalog-products";
import type { Product } from "@/types/product";

function bySlug(products: Product[], slugs: string[]) {
  return slugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product));
}

const eventTopics = [
  { id: "cumpleanos", label: "Cumpleaños" },
  { id: "comunion", label: "Comuniones" },
  { id: "casamientos", label: "Bodas" },
  { id: "fiestas", label: "Fiestas" },
];

export async function FeaturedCategories() {
  const catalog = await getCatalogProducts();
  const infantilProducts = bySlug(catalog, [
    "cartel-de-recien-nacido",
    "letra-plana-14x14",
    "memotest",
    "rompecabezas-28x20",
  ]);
  const hogarProducts = bySlug(catalog, [
    "velador-stitch-28x28",
    "letra-3d-con-luz",
    "arbol-de-la-vida-30x30",
  ]);
  const eventosProducts = bySlug(catalog, [
    "tateti-tematico",
    "llavero-personalizado",
  ]);
  const organizadoresProducts = bySlug(catalog, [
    "portallaveros-de-5-ganchos",
    "arbol-de-la-vida-30x30",
  ]);

  return (
    <section
      className="w-full px-container-margin py-xl"
      id="categorias"
      style={{ width: "100%" }}
    >
      <div
        className="mx-auto flex flex-col gap-xl"
        style={{ width: "100%", maxWidth: "80rem" }}
      >
        <header className="text-center">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Categorías destacadas
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-sm">
            Elegí el universo de tu pieza y filtramos la galería por vos.
          </p>
        </header>

        <FeaturedCategoryHero products={infantilProducts} />
        <FeaturedCategoryBannerCarousel products={hogarProducts} />
        <FeaturedCategoryGrid
          products={eventosProducts}
          topics={eventTopics}
        />
        <FeaturedCategorySlim products={organizadoresProducts} />
      </div>
    </section>
  );
}
