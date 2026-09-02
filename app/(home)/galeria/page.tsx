import type { Metadata } from "next";
import { GalleryContent } from "./gallery-content";

export const metadata: Metadata = {
  title: "Galería | Taller Yeyu",
  description:
    "Inspiración y arte en cada pieza personalizada de Taller Yeyu.",
};

export default function GaleriaPage() {
  return (
    <main className="w-full">
      <GalleryContent />
    </main>
  );
}
