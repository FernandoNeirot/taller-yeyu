import { initialProducts } from "@/data/initialProducts";
import { FeaturedCategoryBannerCarousel } from "@/components/home/FeaturedCategoryBannerCarousel";
import { FeaturedCategoryGrid } from "@/components/home/FeaturedCategoryGrid";
import { FeaturedCategoryHero } from "@/components/home/FeaturedCategoryHero";
import { FeaturedCategorySlim } from "@/components/home/FeaturedCategorySlim";
import type { Product } from "@/types/product";

function bySlug(slugs: string[]): Product[] {
  return slugs
    .map((slug) => initialProducts.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product));
}

const infantilProducts = bySlug([
  "cartel-redondo-de-pared-bienvenida-iniciales",
  "medidor-infantil-de-altura-con-riel",
  "reloj-didactico-infantil-aprende-la-hora",
  "kit-creativo-de-figuras-para-pintar",
]);

const hogarProducts = bySlug([
  "cuadro-wall-art-geometrico",
  "velador-tematico-led",
  "set-portallaves-de-pared-con-llaveros-encajables",
  "adorno-mural-bicapa-profundidad",
  "cuadro-calado-artistico",
  "frase-decorativa-en-mdf-troquelado",
]);

const eventosProducts = bySlug([
  "centro-de-mesa-tematico",
  "cake-topper-personalizado-nombre-edad",
  "caja-calada-multiuso-lapicero-souvenir",
  "numeros-decorativos-para-cumpleanos-de-decadas",
]);

const organizadoresProducts = bySlug([
  "organizador-multiuso-de-escritorio",
  "caja-organizadora-porta-te-con-tapa",
  "sistema-de-separadores-de-cajon-modulares",
  "porta-servilletas-decorativo",
  "porta-llaves-ganchera-rustica-de-cocina",
]);

const eventTopics = [
  { id: "cumpleanos", label: "Cumpleaños" },
  { id: "comunion", label: "Comuniones" },
  { id: "casamientos", label: "Bodas" },
  { id: "fiestas", label: "Fiestas" },
];

export function FeaturedCategories() {
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
