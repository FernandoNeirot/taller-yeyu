import type { Metadata } from "next";
import { getProducts } from "@/lib/products/repository";
import { JsonLd, getGalleryJsonLd } from "@/lib/seo/json-ld";
import { getShareImage } from "@/lib/seo/site";
import { GalleryContent } from "./gallery-content";

const galleryDescription =
  "Inspiración y arte en cada pieza personalizada de Taller Yeyu.";

export const metadata: Metadata = {
  title: "Galería",
  description: galleryDescription,
  alternates: {
    canonical: "/galeria",
  },
  openGraph: {
    title: "Galería | Taller Yeyu",
    description: galleryDescription,
    url: "/galeria",
    type: "website",
    locale: "es_AR",
    siteName: "Taller Yeyu",
    images: [getShareImage()],
  },
  twitter: {
    card: "summary_large_image",
    title: "Galería | Taller Yeyu",
    description: galleryDescription,
    images: [getShareImage()],
  },
};

export default async function GaleriaPage() {
  const products = await getProducts();

  return (
    <main className="w-full">
      <JsonLd data={getGalleryJsonLd(products)} />
      <GalleryContent products={products} />
    </main>
  );
}
