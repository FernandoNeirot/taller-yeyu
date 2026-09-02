"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MaterialIcon } from "../_components/material-icon";

const filters = [
  { id: "todos", label: "Todos" },
  { id: "iluminacion", label: "Iluminación" },
  { id: "kits", label: "Kits" },
  { id: "souvenirs", label: "Souvenirs" },
] as const;

type FilterId = (typeof filters)[number]["id"];

const featured = {
  category: "kits",
  title: "Kits de Bienvenida",
  description: "Piezas únicas cortadas a láser para celebrar nuevas vidas.",
  alt: "Taller Yeyu Kits de Bienvenida",
  image:
    "https://lh3.googleusercontent.com/aida/AEtjO1XpZksR7sB4weVe7JsnjD4OEfWH8vSZPPFfIhduWv5sg7gBHCRfO5epgfAOcLnueCAFj81f80tdMGeOvFf7OtsTJLx2i341UhDn_fP3KZSMDsCvA9UFDFNPdxSEYwaVnBupkUqcvS_20RFdTXW2S85ywyQcCSEcPjLKbPzlsTd16KnGC0vGqH7xeklAeBH7zG4Jzarv9GVkGEY8vSVjFELxqoSTY-CMkmLMWPGl7X6vEjTnEaJ3jJellyY",
};

const pairCards = [
  {
    category: "iluminacion",
    tag: "Iluminación",
    title: "Veladores Geométricos",
    alt: "Veladores Geométricos premium wood lighting",
    image:
      "https://lh3.googleusercontent.com/aida/AEtjO1XkWecc9_LhyLt4Wjrv6wSkBLoMz144x8SW9x1-5YO2ycZLAkFW_SOOkj81v66l63RCuk2GOE5p_OD_MtucSag5rSXArI3yN2Qd_2nAJE8vhcyqcE3XG5YSAAyHNScnuNKPBy0DssjQigptKN6QXHdDQT3HE6IXOv5x6-4vcjwouUsvLdvKq2tefu9xTds6MVL6JxVbwLvOsHXRyRtXivICQdD214IobxbguNuodRacpR9ka1GeuqCl4Pw",
  },
  {
    category: "souvenirs",
    tag: "Souvenirs",
    title: "Cajitas de Recuerdo",
    alt: "Cajitas de Souvenir intricately cut wood",
    image:
      "https://lh3.googleusercontent.com/aida/AEtjO1VXulbQkWTyv8sh5TJ9m3DcosSVXvKF3ZVJjzcJqXgoSYJv0VrN7DA5E8fAJQfd89SQXigie6ptapJWMm-9b3jDUlD4raBWj-duADjgmyvdrzb_FDMFACxr_iG_wiTiQ6qFQrBShj1MlJfyyH5TOajA_WD1Zm_BWEWwa_7Wlb4MOD5a_BcrGmbhTWYQWc9dctR1aY9l_2ud2FEX3aM2pr9rofCiGL5ztEJzKNaRx-IlFlq-JjBE2dovyXw",
  },
];

const themes = [
  {
    title: "Diseño Héroes",
    alt: "Temática Infantil 1",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAfzL_HwtelQUqSWeLEZEhTb4LgZVzTluZndbVge7SMDlY4PxmLo8UmVLGZHMZOA22wg1BANQzZ6nlE8AdMk9PqUBh1FJ97rHh_mLUNkkN2JyHZtFG6FDe_EM86GwZEVTTtlcTsWOurH_i8sJO0ZrV_U5aHSkTcTnk9YhLihBpUop_tbEs4-hOyRj4WVWFRVML72gG2l_9EYWsoDASxV9DG0g5Bo9SMSA3jUSGHXLxP6utOlcQmcR635cSYPeK4uBBRSA",
  },
  {
    title: "Mundo Mágico",
    alt: "Temática Infantil 2",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBuZVJr7dhzbqSI2ZamQcXIWfuZv_ul2I4UGKg_ZY2fcpIC8Ogf0FhA5GTfzxzKY3Xh2lUEd0qnKpoTtzMrei_OL2I70VVf8MMti4Z94YmvSkbftQragtkFWkZKmIJbVOxQz-MPu6ddwFD5Z27EBEGxUCRo42kZAj8d4VVUdfjGucjFzirq8z2h8XTdtzSfRGbNARFdsSV9EstxnZePWU-Ce99ROFklfZdNRuFcBQ2P6ybd3FsMNrngPX-BHPnrcI2vUg",
  },
  {
    title: "Aventura Espacial",
    alt: "Temática Infantil 3",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDXtqBBWMTFqJ2iEOiU1RMN1JNimLDK_xS5-Z9lt0AY0bWsiHnw52WZPa-h_POMOV1GHGE7yBnHS5DP1n_RBpJmC_rjtxz6IxZRFyGJzGEmgl5K6sCeCM9gHJ2iuwHf9NhuwnZ0lx4OArwWvsmL97gxRwfasqbodQcQdo0Xl-bMUDXJW8_hAzzfWLhLrVJyFq7zsy7vdom_iP_k6STAGR7PO4nn6PZ_-OTk_GdGSOF_97Zp8sUf2PYjQV9fBfJ7jh_gzA",
  },
];

const customLamps = {
  category: "iluminacion",
  title: "Lámparas Personalizadas",
  description: "Luz cálida con tu nombre y diseño favorito.",
  alt: "Lámparas Personalizadas glowing warm light",
  image:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBAapKZGhAxZOAcntsqsobhvwieVxetZtrXgTPZs9i98sRtPxV_lxeBt1K4nYyZpCuQZl7gNOZrNE-TenrEm7mxF1pbf460UKmUcQcTLS716gB_KhcsIZ3xE5iFbBjJn8JUdGKsXun2zDfj_7sGqCRnVTB9pWNiQSpK60rH6E8vqfVsvJVYwJPD2dbYYyiMHavWXBtzz0oXjobaDiEJuPw-EN-n-EUPwDcclgms4R2OqlUQcUT7HNMygrKs5hVr5DwtTQ",
};

const extraTiles = [
  {
    category: "iluminacion",
    alt: "Detail of custom lamp cutouts",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC9RRZ3oS7CyWyy40N1WFv3YyZbS1vlCK3msbNVuSVRMwI_yxVj8mYbnKo6YmDTYnRCOM7kVDUEh57LpVaW_QGDcqwS4qG01gB5aeiWlIHWOJYDjoy4WlKmkf6d-IzZDGcPzThSkQse4N30kD3uZVSSVI_7uhz-h7DIHzjeKJjrr-FyRP8TtxjALRWtUyWO_TbXmWn_M7Vq_FBbun7CeEGXA95sTOnUhYZ3d1Z4TZwYr7_CqfiXAiPmNmajqGUopz3c2A",
  },
  {
    category: "kits",
    alt: "Kits para Pintar artisan craft kit",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAbWJcYk8CfHebyFnILSbjf0PEmvAglQWegifWmfigvAKWesQY01xF8xno0yShVJEA-ZjxID_W5pwHoyejYbeJYNJuCtGHP_viRjVUaIN5Us6rzoqcJtVbXoj8N_i193GIRfKYK2mhOrmsjEMfNxPn0mN2-DfKWd-SADkCnnS_OpTGTuB1vfbaBpclJVXaHGZX7P-ZTyud4UJxV20fPVlgbKrFQTt3nc_l9ptJp3Ifim-pf92WZssgn8RaYJ6y97zr4BQ",
  },
];

function matches(filter: FilterId, category: string) {
  return filter === "todos" || filter === category;
}

export function GalleryContent() {
  const [filter, setFilter] = useState<FilterId>("todos");
  const visiblePair = pairCards.filter((card) => matches(filter, card.category));
  const showFeatured = matches(filter, featured.category);
  const showThemes = filter === "todos" || filter === "kits" || filter === "souvenirs";
  const showLamps = matches(filter, customLamps.category);
  const visibleTiles = extraTiles.filter((tile) => matches(filter, tile.category));

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto">
      <section className="px-container-margin py-lg flex flex-col gap-sm">
        <h1 className="font-headline-xl text-headline-xl text-primary">
          Galería de Creaciones
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Inspiración y arte en cada pieza personalizada.
        </p>
      </section>

      <section className="px-container-margin pb-md overflow-x-auto whitespace-nowrap hide-scrollbar flex items-center gap-sm">
        {filters.map((item) => {
          const active = item.id === filter;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={
                active
                  ? "px-4 py-2 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps transition-colors"
                  : "px-4 py-2 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant font-label-caps text-label-caps hover:bg-surface-container-high transition-colors"
              }
            >
              {item.label}
            </button>
          );
        })}
      </section>

      <section className="px-container-margin pb-xl flex flex-col gap-md">
        {showFeatured ? (
          <div className="w-full relative rounded-xl overflow-hidden bg-surface-container">
            <div className="relative aspect-4/3 w-full">
              <Image
                alt={featured.alt}
                src={featured.image}
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 80rem, 100vw"
                unoptimized
                priority
              />
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-headline-md text-headline-md text-primary">
                {featured.title}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1 line-clamp-2">
                {featured.description}
              </p>
            </div>
          </div>
        ) : null}

        {visiblePair.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {visiblePair.map((card) => (
              <div
                key={card.title}
                className="w-full relative rounded-xl overflow-hidden bg-surface-container flex flex-col"
              >
                <div className="relative aspect-square w-full">
                  <Image
                    alt={card.alt}
                    src={card.image}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 40vw, 50vw"
                    unoptimized
                  />
                </div>
                <div className="p-3 bg-surface-container-high flex-1">
                  <h4 className="font-label-caps text-label-caps text-secondary tracking-widest">
                    {card.tag}
                  </h4>
                  <h3 className="font-headline-md text-headline-md text-on-surface mt-1 leading-tight">
                    {card.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {showThemes ? (
          <div className="pt-4">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-3">
              Temáticas Infantiles
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
              {themes.map((theme) => (
                <div
                  key={theme.title}
                  className="snap-center shrink-0 w-60 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/30"
                >
                  <Image
                    alt={theme.alt}
                    src={theme.image}
                    width={240}
                    height={192}
                    className="w-full h-48 object-cover"
                    unoptimized
                  />
                  <div className="p-4 bg-surface-container-highest">
                    <h3 className="font-headline-md text-[18px] text-on-surface">
                      {theme.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {showLamps || visibleTiles.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 mt-2">
            {showLamps ? (
              <div className="col-span-2 relative rounded-xl overflow-hidden">
                <div className="relative aspect-video w-full">
                  <Image
                    alt={customLamps.alt}
                    src={customLamps.image}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 80rem, 100vw"
                    unoptimized
                  />
                </div>
                <div className="absolute inset-0 bg-background/60 flex flex-col justify-end p-4">
                  <h3 className="font-headline-md text-headline-md text-primary">
                    {customLamps.title}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {customLamps.description}
                  </p>
                </div>
              </div>
            ) : null}
            {visibleTiles.map((tile) => (
              <div
                key={tile.alt}
                className="relative w-full h-32 rounded-xl overflow-hidden"
              >
                <Image
                  alt={tile.alt}
                  src={tile.image}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 40vw, 50vw"
                  unoptimized
                />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="px-container-margin pb-xl">
        <div className="bg-surface-container-highest rounded-xl p-6 text-center border border-outline-variant/50">
          <MaterialIcon
            name="handyman"
            className="text-primary text-4xl mb-2"
          />
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
            ¿Tienes una idea?
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Convertimos tus conceptos en piezas únicas de madera cortada con
            precisión láser.
          </p>
          <Link
            href="/#contacto"
            className="inline-flex w-full items-center justify-center py-4 rounded bg-primary text-on-primary font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary-fixed transition-colors"
          >
            Hacer un Pedido Especial
          </Link>
        </div>
      </section>
    </div>
  );
}
