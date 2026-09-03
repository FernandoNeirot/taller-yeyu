import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { MaterialIcon } from "@/components/ui/material-icon";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const HERO_IMAGE =
  "/principal.png";

const PROCESS_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDXdThLsiPpi2lVmLN1j8tOrCnXRL_ZFl28S7bR094mQyg7AyJc8yc6KCZeKruPW-hCclEJDfgHa4XRUfvMxQiZF0AUlJDx-zEqvsTc0TQpxHB3ZLE9gCTd2AO_Udisj6vHKN6kaspdWYp8ikTdIBf4_DSY1EUHqiq5geu2py4RWsa11AiilZ9lSMnKP8LobiWi90MQuJTwGsGqJjQ9xFFtJkQMp1-dtmVwXuSkUuG0Wf05Zy4TmC__PQbOd3h2VjGnaA";

const categories = [
  {
    title: "Carteles de Bienvenida",
    description:
      "Letreros de madera personalizados para nacimientos y eventos especiales.",
    icon: "celebration",
    alt: "Carteles de Bienvenida",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDSsq_sPD6WLYOnF-5JP8le71segMQlAyLgNYHP6k7QWKA01R4iLSu-ND4i_PvawKGXW3QbDhiqgFuk9juPX4PpIgvSkFjZSNKBJTcrxhrOEbdMZ8QMZtidEx2qRbNf_R5LjGmqf3-kHNp5wtKLwrTKhP0rHXbqeO__y-brF_1aGURKwrN4sH3XU3GFWxX0_QGfakxzpI5QExurgiPU2ke_KOsTUcIe5SMl4zx8gArC6-SudlD2ksv_FoCJNse1vfJnHg",
  },
  {
    title: "Kits para Pintar",
    description:
      "Figuras de madera con acuarelas, ideales para fomentar la creatividad en familia.",
    icon: "palette",
    alt: "Kits para Pintar",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAho5AlWxYbFkLjAu_fS490MkO6nBvkGN8Q-z8lNmS7Cicjaw0-erx-P3LnwHhr09MpwvbQPkUD9QdkMPPMXR2lQ8rclevyb2bdImrl_m6gU0wIPTY9X8YSRnCKfUc-1gYJfiemGMD3lcDOwm6Btop0Thb2SlvSbcOkigycFFELpZHrabhI9G2QAfmhl6i7ZxD2giIMsnbsdYfegIRWsustiJ9SD2ARlDS-MBPDfWLNHluxP9s5kfQauLMuOhyyQ8FM9w",
  },
  {
    title: "Souvenirs Temáticos",
    description:
      "Llaveros y cajitas hechas a medida para que tu evento sea inolvidable.",
    icon: "redeem",
    alt: "Souvenirs Temáticos",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBVel3cDWoR2WwWFX2sLL_EfX94hzO96ujeK2Z3D3HaQ8YB4b_jUQfmu1egwM3slZ0AL0wtUmqKrp5al6ERPGbdMFjmJAtz6mJzpnqm2UfW9E6njG3f8uJa8H1mYJ-2XZUqkBvovb8-bEHo8DcKjPddbpcFGRqkM9a5ciqxVe3gM_MZcN11aestrEkmeaa1A0xn8GMsFWeswUTKsPNgZqB8hiswYOG8zTUXYjyQm7Of_YbfEbPI7Cuo3iSBxIeotQMrRQ",
  },
];

const processHighlights = [
  "Diseños 100% personalizados a tu gusto",
  "Kits de arte para disfrutar momentos en familia",
  "Detalles únicos y cálidos para tus eventos",
];

const galleryItems = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzxtyiK6SePWtejtrtycNRMcakKadxoKdHAST7X08AqaIsoQG-tAoVowTmUQ-K_eesIsqdf1k1gzTJwaXGZRyYMaJnFmZueYx_zcEVK1i-5Vl_NsHJZ1Q-W2UblH2zdFqukNcZJVoHJXBQRdKdsV63vt7HswmIZ2Ex0TnM8bo1QoDGEpjsAbfidgzrJp7kR7CT9VfZm6mIeZcIniP7Z2t1O7rZjGLMs2e9mHwVrkEygCaoBLPGyP4eC6hNdTwoZGQUTw",
    alt: "Velador artesanal de madera con luz cálida",
    featured: true,
    tag: "DECORACIÓN",
    title: "Veladores Personalizados",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDApURG9jrGXskfpJ8TImYRiyvyAROmymls1m11Kpcq-UygkeGzyvx2q8ES15WaHdxOevfbz-g5xdDL44Y3mVDXKLkhkqPpJ4YXl1IbRXf3PTlw3xKpu1WMTqcCuWyd_2q7rA5ASjbXlcPeB-9LNf-tOgeg2UhwYSYVvHpKXI73P4vpe8qhStGGcqkJERAEbrvPTxQi-0UUNB0gUXdQocnd0YWSLLn8nkl43Is1vkoteS7VkEJ-lE-7n5PfK9n-XDrecg",
    alt: "Cajas grabadas personalizadas",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCei0rCROmbILYsK250bznUhr8KEf8wmyIPXfqrYvM5t3W7KmRNNnEBwYBulc8tPJn5KR4wD-GSKNyunvVxnrgvYHBFxZWPBEifEuMQsMmmQf-fI-AoTHR8FN4dZJbP3ERLXwhWjeb59Ee2qSAxvsuMYf89UrSDskMJDra-vbtm4JJ6EzR4ZWDjCWORQkVv4cUalbOaDBBY5mSwL8wmSWXIONM0aKW2KtoX-VJnStyoWhRKqNxlGYhSbffIzB19Z-ZBEQ",
    alt: "Pieza de galería 3",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAt57UcFZW6cOZIWy31AcDAgtjGOw7tWbNXZ4Q__1CHcVLzyyz8VXEFZKIDrJGKbwBmYiOrVM9m6MBHpQk9jub6RuwhN2s2laUFhYzSzWL2mHcmZBGVwY4iQuSnnoJlt54ZYcZJTFCJvXywLcluIFibPky51K-qG4wPt2xu71hYDKtkVgAhYZ2oapNR203zgcQPQwIlaMmtWWTE4oOr4FaNUiFE5EyjmaB6yO54wKRfjwVZwn8LRDmIzAXHV3E1NB7cqQ",
    alt: "Pieza de galería 4",
  },
];

export default function Home() {
  return (
    <main className="w-full">
      <section
        id="inicio"
        className="relative w-full min-h-[85vh] flex items-center justify-center px-container-margin py-xl overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-b from-background/70 via-background/50 to-background z-10" />
          <Image
            alt="Primer plano de manos artesanas ensamblando una caja de madera con juntas de precisión en un taller cálido."
            className="object-cover opacity-80"
            src={HERO_IMAGE}
            fill
            priority
            sizes="100vw"
            unoptimized
          />
        </div>
        <div className="relative z-20 flex flex-col items-center text-center max-w-3xl mx-auto space-y-md">
          <h1 className="flex flex-col items-center">
            <span className="sr-only">Taller Yeyu</span>
            <Logo
              priority
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
            className="inline-flex items-center justify-center px-8 py-4 bg-primary-container text-white font-label-caps text-label-caps tracking-widest hover:bg-secondary-container transition-colors duration-300 active:scale-95 uppercase"
            href="/galeria"
          >
            Ver Catálogo
          </Link>
        </div>
      </section>

      <section className="w-full px-container-margin py-xl max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md md:gap-lg">
          {categories.map((category) => (
            <div
              key={category.title}
              className="relative group overflow-hidden bg-surface-container-low border border-outline-variant/20 aspect-4/3 md:aspect-auto md:min-h-75 flex flex-col justify-end p-lg"
            >
              <Image
                alt={category.alt}
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                src={category.image}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent z-10" />
              <div className="absolute top-lg right-lg z-20 w-12 h-12 bg-surface-container-highest/80 backdrop-blur-sm rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <MaterialIcon name={category.icon} />
              </div>
              <div className="relative z-20">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">
                  {category.title}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {category.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="w-full px-container-margin py-xl bg-surface-container-lowest border-y border-outline-variant/20"
        id="proceso"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-xl">
          <div className="w-full md:w-1/2 relative aspect-square md:aspect-auto md:min-h-125">
            <Image
              alt="Personalización y Arte"
              className="object-cover"
              src={PROCESS_IMAGE}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              unoptimized
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

      <section
        className="w-full px-container-margin py-xl max-w-7xl mx-auto"
        id="galeria"
      >
        <div className="text-center mb-lg">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-xs">
            Inspiración para tu Espacio
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Colección de piezas destacadas
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-unit md:gap-md">
          {galleryItems.map((item) =>
            item.featured ? (
              <div
                key={item.src}
                className="col-span-2 row-span-2 relative group overflow-hidden bg-surface-container aspect-square md:aspect-auto md:min-h-100"
              >
                <Image
                  alt={item.alt}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  src={item.src}
                  fill
                  sizes="(min-width: 768px) 66vw, 100vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-md">
                  <span className="font-label-caps text-label-caps text-primary tracking-widest bg-surface/80 px-2 py-1 w-fit mb-xs">
                    {item.tag}
                  </span>
                  <h4 className="font-headline-md text-headline-md text-on-surface">
                    {item.title}
                  </h4>
                </div>
              </div>
            ) : (
              <div
                key={item.src}
                className="relative group overflow-hidden bg-surface-container aspect-square"
              >
                <Image
                  alt={item.alt}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  src={item.src}
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  unoptimized
                />
              </div>
            ),
          )}
        </div>
      </section>

      <section
        className="w-full px-container-margin py-xl mb-xl"
        id="contacto"
      >
        <div className="max-w-4xl mx-auto bg-surface-container-high border border-outline-variant/30 p-lg md:p-xl flex flex-col items-center text-center space-y-md">
          <MaterialIcon
            name="architecture"
            className="text-4xl text-primary mb-xs"
          />
          <h2 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-on-surface">
            Contanos tu ocasión
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant w-full">
            Baby shower, cumpleaños o un regalo especial: decinos la temática y
            te armamos sugerencias a medida.
          </p>
          <a
            className="mt-md inline-flex items-center gap-sm px-6 py-3 border border-primary text-primary font-label-caps text-label-caps tracking-widest hover:bg-primary/10 transition-colors duration-300 active:scale-95 uppercase"
            href="#"
          >
            Consultar por Pedidos Personalizados
            <MaterialIcon name="arrow_forward" className="text-sm" />
          </a>
        </div>
      </section>
    </main>
  );
}
