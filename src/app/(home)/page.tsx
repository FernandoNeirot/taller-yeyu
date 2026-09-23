import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { CustomWorkSection } from "@/components/home/CustomWorkSection";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { Logo } from "@/components/layout/logo";
import { MaterialIcon } from "@/components/ui/material-icon";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const HERO_IMAGE = "/principal.webp";
const HERO_IMAGE_MOBILE = "/principal-mobile.webp";
const PROCESS_IMAGE = "/proceso.webp";

const processHighlights = [
  "Diseños 100% personalizados a tu gusto",
  "Kits de arte para disfrutar momentos en familia",
  "Detalles únicos y cálidos para tus eventos",
];

function FeaturedCategoriesFallback() {
  return (
    <section className="w-full px-container-margin py-xl" aria-hidden="true">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto h-8 w-64 rounded bg-surface-container" />
        <div className="mt-lg min-h-72 rounded-3xl bg-surface-container" />
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main id="contenido" className="w-full">
      <link
        rel="preload"
        as="image"
        href={HERO_IMAGE_MOBILE}
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={HERO_IMAGE}
        media="(min-width: 768px)"
        fetchPriority="high"
      />
      <section
        id="inicio"
        className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-container-margin py-xl"
      >
        <div className="absolute inset-0 z-0">
          <picture className="absolute inset-0 block h-full w-full">
            <source
              media="(max-width: 767px)"
              srcSet={HERO_IMAGE_MOBILE}
              type="image/webp"
            />
            <img
              alt=""
              src={HERO_IMAGE}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </picture>
          <div
            className="absolute inset-0 z-10"
            style={{ background: "rgba(19, 19, 19, 0.88)", width: "100%", height: "100%" }}
          />
        </div>
        <div className="relative z-20 flex flex-col items-center text-center max-w-3xl mx-auto space-y-md">
          <h1 className="flex flex-col items-center">
            <span className="sr-only">Taller Yeyu</span>
            <Logo
              alt=""
              className="h-36 sm:h-44 md:h-52 w-auto object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.55)]"
            />
          </h1>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Regalos con Alma.
            <br className="md:hidden" /> Momentos para Compartir.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-sm mb-lg">
            Somos un emprendimiento familiar dedicado a crear piezas únicas,
            kits para pintar y souvenirs personalizados que invitan a crear y
            compartir en familia.
          </p>
          <Link
            className="touch-target inline-flex items-center justify-center px-8 bg-primary-container text-white font-label-caps text-label-caps tracking-widest hover:bg-secondary-container transition-colors duration-300 active:scale-95 uppercase"
            href="/galeria"
          >
            Ver Catálogo
          </Link>
        </div>
      </section>

      <Suspense fallback={<FeaturedCategoriesFallback />}>
        <FeaturedCategories />
      </Suspense>

      <section
        className="w-full px-container-margin py-xl bg-surface-container-lowest border-y border-outline-variant/20"
        id="proceso"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-xl">
          <div className="w-full md:w-1/2 relative aspect-square md:aspect-auto md:min-h-125">
            <Image
              alt=""
              className="object-cover"
              src={PROCESS_IMAGE}
              fill
              loading="lazy"
              sizes="(min-width: 768px) 50vw, 100vw"
              quality={70}
            />
            <div className="absolute bottom-0 left-0 bg-background/90 backdrop-blur-md p-md border-t border-r border-outline-variant/30">
              <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                Creatividad Compartida
              </span>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-md">
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
              Arte y Personalización en cada Detalle
            </h2>
            <div className="w-12 h-1 bg-primary-container" />
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Cada pieza nace de una idea tuya. Diseñamos souvenirs, carteles y
              kits de pintura que invitan a compartir, regalar y crear recuerdos
              únicos en familia. Combinamos la calidez de la madera con diseños
              exclusivos para cada ocasión.
            </p>
            <ul className="space-y-sm mt-md font-body-md text-body-md text-on-surface">
              {processHighlights.map((item) => (
                <li key={item} className="flex items-center gap-sm">
                  <MaterialIcon name="check" className="text-primary text-sm" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CustomWorkSection />
    </main>
  );
}
