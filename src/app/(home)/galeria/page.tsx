import { getProducts } from "@/features/products/services/get-products";
import { JsonLd, getGalleryJsonLd } from "@/lib/seo/json-ld";
import { sharePageMetadata } from "@/lib/seo/metadata";
import { GalleryContent } from "@/features/products/components/gallery-content";
import { ProductsHydration } from "@/features/products/components/products-hydration";

const galleryDescription =
  "Inspiración y arte en cada pieza personalizada de Taller Yeyu.";

export const metadata = sharePageMetadata({
  title: "Galería",
  description: galleryDescription,
  path: "/galeria",
});

export default async function GaleriaPage() {
  const products = await getProducts();

  return (
    <main className="w-full">
      <JsonLd data={getGalleryJsonLd(products)} />
      <ProductsHydration products={products}>
        <GalleryContent />
      </ProductsHydration>
    </main>
  );
}
