import { getCatalogProducts } from "@/features/products/services/get-catalog-products";
import { GalleryContent } from "@/features/products/components/gallery-content";
import { JsonLd, getGalleryJsonLd } from "@/lib/seo/json-ld";
import { sharePageMetadata } from "@/lib/seo/metadata";

const galleryDescription =
  "Inspiración y arte en cada pieza personalizada de Taller Yeyu.";

export const metadata = sharePageMetadata({
  title: "Galería",
  description: galleryDescription,
  path: "/galeria",
});

export default async function GaleriaPage() {
  const products = await getCatalogProducts();

  return (
    <main className="w-full">
      <JsonLd
        data={getGalleryJsonLd(
          products.map((product) => ({
            title: product.title,
            description: product.shortDescription,
            image: product.featuredImage,
          })),
        )}
      />
      <GalleryContent products={products} />
    </main>
  );
}
