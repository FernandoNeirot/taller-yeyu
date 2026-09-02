import { getProducts } from "@/lib/products/repository";
import { JsonLd, getGalleryJsonLd } from "@/lib/seo/json-ld";
import { sharePageMetadata } from "@/lib/seo/metadata";
import { GalleryContent } from "./gallery-content";

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
      <GalleryContent products={products} />
    </main>
  );
}
