import type { Metadata } from "next";
import { getProducts } from "@/lib/products/repository";
import { GalleryContent } from "./gallery-content";

export const metadata: Metadata = {
  title: "Galería | Taller Yeyu",
  description:
    "Inspiración y arte en cada pieza personalizada de Taller Yeyu.",
};

export default async function GaleriaPage() {
  const products = await getProducts();

  return (
    <main className="w-full">
      <GalleryContent products={products} />
    </main>
  );
}
