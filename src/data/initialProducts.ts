import {
  DEFAULT_LABOR_HOURLY_RATE,
  DEFAULT_MACHINE_HOURLY_RATE,
  computeAccessoryAmount,
  computeCostQuoteTotal,
  computeMachineAmount,
  computeWoodAmount,
  type ProductCostQuote,
  type WoodFaceType,
} from "@/features/products/lib/cost-quote";
import type { Product } from "@/types/product";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/500";
const CREATED_AT = "2026-09-14";

type SeedProduct = Omit<
  Product,
  "id" | "featuredImage" | "galleryImages" | "isActive" | "createdAt"
> & {
  featuredImage?: string;
  galleryImages?: string[];
};

function createProduct(product: SeedProduct): Product {
  const image = product.featuredImage ?? PLACEHOLDER_IMAGE;

  return {
    ...product,
    id: product.slug,
    featuredImage: image,
    galleryImages: product.galleryImages ?? [image],
    isActive: true,
    createdAt: CREATED_AT,
  };
}

type SeedCostQuote = {
  wood: { widthCm: number; lengthCm: number; quantity?: number; face: WoodFaceType };
  machineMinutes: number;
  laborMinutes: number;
  accessories?: { name: string; quantity: number; unitPrice: number }[];
  paintAmount?: number;
};

/** Arma un costQuote con los importes calculados igual que el cotizador. */
function createCostQuote(input: SeedCostQuote): ProductCostQuote {
  const woodAmount = computeWoodAmount({
    quantity: input.wood.quantity ?? 1,
    widthCm: input.wood.widthCm,
    lengthCm: input.wood.lengthCm,
    face: input.wood.face,
  });
  const machineAmount = computeMachineAmount({
    minutes: input.machineMinutes,
    hourlyRate: DEFAULT_MACHINE_HOURLY_RATE,
  });
  const laborAmount = computeMachineAmount({
    minutes: input.laborMinutes,
    hourlyRate: DEFAULT_LABOR_HOURLY_RATE,
  });
  const quote: ProductCostQuote = {
    woods: [
      {
        id: "wood-1",
        quantity: input.wood.quantity ?? 1,
        widthCm: input.wood.widthCm,
        lengthCm: input.wood.lengthCm,
        face: input.wood.face,
        amount: woodAmount,
      },
    ],
    woodAmount,
    machineMinutes: input.machineMinutes,
    machineHourlyRate: DEFAULT_MACHINE_HOURLY_RATE,
    machineAmount,
    laborMinutes: input.laborMinutes,
    laborHourlyRate: DEFAULT_LABOR_HOURLY_RATE,
    laborAmount,
    accessories: (input.accessories ?? []).map((item, index) => ({
      id: `accessory-${index + 1}`,
      materialId: `seed-${index + 1}`,
      materialName: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      measureType: "unidad" as const,
      amount: computeAccessoryAmount(item.quantity, item.unitPrice),
    })),
    usesPaint: Boolean(input.paintAmount),
    paintAmount: input.paintAmount,
  };
  quote.totalAmount = computeCostQuoteTotal(quote);
  return quote;
}

export const initialProducts: Product[] = [
  // ── Souvenirs y Eventos ──────────────────────────────────────────────
  createProduct({
    title: "Tateti Temático",
    slug: "tateti-tematico",
    shortDescription:
      "Tateti de MDF con fichas temáticas a elección, ideal como souvenir o regalo.",
    fullDescription:
      "Tablero de tateti calado en MDF con fichas temáticas a elección (personajes, deportes, animales). Se entrega pintado y listo para jugar. Ideal como souvenir de cumpleaños o regalo de egreso.",
    categories: ["souvenirs-y-eventos"],
    topics: ["souvenirs", "cumpleanos", "juegos"],
    specifications: {
      material: "MDF 3mm",
      dimensions: "15x15 cm",
      thickness: "3mm",
      hasLighting: false,
      powerSource: "ninguno",
      heightCm: 15,
      widthCm: 15,
      finish: "Pintado a mano",
      customizable: true,
    },
    price: 32000,
    packOptions: [
      { quantity: 10, price: 32000 },
      { quantity: 20, price: 60000 },
      { quantity: 30, price: 84000 },
    ],
    weightGrams: 180,
    dimensions: { heightCm: 15, widthCm: 15, lengthCm: 1 },
    costQuote: createCostQuote({
      wood: { widthCm: 15, lengthCm: 15, face: "natural" },
      machineMinutes: 6,
      laborMinutes: 10,
      accessories: [{ name: "Bolsita de presentación", quantity: 1, unitPrice: 150 }],
      paintAmount: 400,
    }),
  }),
  createProduct({
    title: "Llavero Personalizado",
    slug: "llavero-personalizado",
    shortDescription:
      "Llaveros calados o grabados con nombre, forma o logo, en packs de 10, 20 o 30.",
    fullDescription:
      "Llaveros en MDF calados o grabados con nombres, formas o logos. Se venden en packs de 10, 20 o 30 unidades, con mejor precio por unidad a mayor cantidad. Incluyen argolla metálica. Ideal para souvenirs masivos, regalos corporativos o merchandising.",
    categories: ["souvenirs-y-eventos"],
    topics: ["souvenirs", "merchandising", "personalizado"],
    specifications: {
      material: "MDF 3mm",
      dimensions: "5x5 cm c/u",
      thickness: "3mm",
      hasLighting: false,
      powerSource: "ninguno",
      heightCm: 5,
      widthCm: 5,
      finish: "Grabado láser",
      customizable: true,
    },
    price: 18000,
    packOptions: [
      { quantity: 10, price: 18000 },
      { quantity: 20, price: 33000 },
      { quantity: 30, price: 45000 },
    ],
    weightGrams: 120,
    dimensions: { heightCm: 6, widthCm: 12, lengthCm: 6 },
    costQuote: createCostQuote({
      wood: { widthCm: 25, lengthCm: 20, face: "natural" },
      machineMinutes: 20,
      laborMinutes: 15,
      accessories: [{ name: "Argolla para llavero", quantity: 10, unitPrice: 120 }],
    }),
  }),

  createProduct({
    title: "Portaretrato Souvenir para Foto 6x6",
    slug: "portaretrato-souvenir-6x6",
    shortDescription:
      "Portaretrato de MDF para foto de 6x6 cm, ideal como souvenir de eventos.",
    fullDescription:
      "Portaretrato calado en MDF para foto de 6x6 cm, con apoyo trasero para que se sostenga solo. Se personaliza con el nombre, la fecha o una frase del evento. Ideal como souvenir de cumpleaños, bautismos, comuniones y casamientos; se vende en packs de 10, 20 o 30 unidades con descuento por cantidad.",
    categories: ["souvenirs-y-eventos"],
    topics: ["portaretrato", "souvenirs", "fotos", "personalizado"],
    specifications: {
      material: "MDF 3mm",
      dimensions: "10x10 cm (foto de 6x6 cm)",
      thickness: "3mm",
      hasLighting: false,
      powerSource: "ninguno",
      heightCm: 10,
      widthCm: 10,
      finish: "Pintado / Grabado láser",
      customizable: true,
    },
    price: 25000,
    packOptions: [
      { quantity: 10, price: 25000 },
      { quantity: 20, price: 47000 },
      { quantity: 30, price: 66000 },
    ],
    weightGrams: 60,
    dimensions: { heightCm: 10, widthCm: 10, lengthCm: 3 },
    costQuote: createCostQuote({
      wood: { widthCm: 10, lengthCm: 20, face: "natural" },
      machineMinutes: 5,
      laborMinutes: 8,
      accessories: [
        { name: "Vidrio / acetato 6x6", quantity: 1, unitPrice: 150 },
        { name: "Bolsita de presentación", quantity: 1, unitPrice: 150 },
      ],
      paintAmount: 250,
    }),
  }),

  // ── Juegos Didácticos ────────────────────────────────────────────────
  createProduct({
    title: "Rompecabezas 28x20",
    slug: "rompecabezas-28x20",
    shortDescription:
      "Rompecabezas de MDF con la imagen o nombre que elijas, 28x20 cm.",
    fullDescription:
      "Rompecabezas de MDF impreso con la imagen, foto o nombre que elijas. Piezas troqueladas con terminación suave, pensado para estimular la motricidad y la concentración. Se entrega en bolsa de tela.",
    categories: ["juegos-didacticos"],
    topics: ["didactico", "infantil", "personalizado"],
    specifications: {
      material: "MDF 3mm",
      dimensions: "28x20 cm",
      thickness: "3mm",
      hasLighting: false,
      powerSource: "ninguno",
      heightCm: 20,
      widthCm: 28,
      finish: "Impresión full color + barniz",
      customizable: true,
    },
    price: 9500,
    weightGrams: 250,
    dimensions: { heightCm: 20, widthCm: 28, lengthCm: 1 },
    costQuote: createCostQuote({
      wood: { widthCm: 28, lengthCm: 20, face: "white" },
      machineMinutes: 15,
      laborMinutes: 20,
      accessories: [
        { name: "Impresión adhesiva", quantity: 1, unitPrice: 900 },
        { name: "Bolsa de tela", quantity: 1, unitPrice: 600 },
      ],
    }),
  }),
  createProduct({
    title: "Memotest",
    slug: "memotest",
    shortDescription:
      "Juego de memoria de MDF con fichas ilustradas y caja contenedora.",
    fullDescription:
      "Memotest de 24 fichas de MDF ilustradas con la temática que prefieras (animales, personajes, letras o números). Incluye caja calada para guardarlo. Ayuda a trabajar memoria y atención.",
    categories: ["juegos-didacticos"],
    topics: ["didactico", "infantil", "memoria"],
    specifications: {
      material: "MDF 3mm",
      dimensions: "Fichas de 5x5 cm (24 u.)",
      thickness: "3mm",
      hasLighting: false,
      powerSource: "ninguno",
      heightCm: 5,
      widthCm: 5,
      finish: "Impresión full color + barniz",
      customizable: true,
    },
    price: 11000,
    weightGrams: 320,
    dimensions: { heightCm: 6, widthCm: 22, lengthCm: 16 },
    costQuote: createCostQuote({
      wood: { widthCm: 40, lengthCm: 30, face: "white" },
      machineMinutes: 25,
      laborMinutes: 25,
      accessories: [{ name: "Impresión adhesiva", quantity: 1, unitPrice: 1200 }],
    }),
  }),

  // ── Iluminación y Deco ───────────────────────────────────────────────
  createProduct({
    title: "Velador Stitch 28x28",
    slug: "velador-stitch-28x28",
    shortDescription:
      "Velador calado con la silueta de Stitch e iluminación LED interior.",
    fullDescription:
      "Velador calado con la silueta de Stitch en capas de MDF, con luz LED cálida interior que crea una iluminación ambiental suave. Funciona con transformador a 220V y cable de 1,5 m con interruptor.",
    categories: ["iluminacion-y-deco"],
    topics: ["iluminacion", "personajes", "infantil"],
    specifications: {
      material: "MDF 3mm + base MDF 18mm",
      dimensions: "28x28 cm",
      thickness: "2cm",
      hasLighting: true,
      powerSource: "220v",
      heightCm: 28,
      widthCm: 28,
      depthCm: 2,
      finish: "Pintado a mano",
      customizable: false,
    },
    price: 24500,
    weightGrams: 600,
    dimensions: { heightCm: 28, widthCm: 28, lengthCm: 5 },
    costQuote: createCostQuote({
      wood: { widthCm: 60, lengthCm: 40, face: "natural" },
      machineMinutes: 35,
      laborMinutes: 60,
      accessories: [
        { name: "Tira LED cálida", quantity: 1, unitPrice: 2200 },
        { name: "Transformador 12V + cable", quantity: 1, unitPrice: 3800 },
      ],
      paintAmount: 1500,
    }),
  }),
  createProduct({
    title: "Letra 3D con Luz",
    slug: "letra-3d-con-luz",
    shortDescription:
      "Letra 3D de MDF con luz LED interior a pila, para escritorio o cuarto.",
    fullDescription:
      "Letra 3D en MDF con luz LED cálida en su interior, a elección (inicial de nombre o símbolo). Funciona a pila, sin cables, y se apoya sobre cualquier superficie. Ideal para cuartos infantiles, escritorios o regalos.",
    categories: ["iluminacion-y-deco"],
    topics: ["iluminacion", "letras", "personalizado"],
    specifications: {
      material: "MDF 3mm + 18mm",
      dimensions: "20x14x5 cm aprox.",
      thickness: "5cm",
      hasLighting: true,
      powerSource: "pila",
      heightCm: 20,
      widthCm: 14,
      depthCm: 5,
      finish: "Pintado / Barnizado",
      customizable: true,
    },
    price: 14500,
    variants: [
      { description: "Luz cálida", price: 14500 },
      { description: "Luz RGB con control", price: 17500 },
    ],
    weightGrams: 350,
    dimensions: { heightCm: 20, widthCm: 14, lengthCm: 5 },
    costQuote: createCostQuote({
      wood: { widthCm: 40, lengthCm: 30, face: "natural" },
      machineMinutes: 25,
      laborMinutes: 40,
      accessories: [
        { name: "Tira LED a pila", quantity: 1, unitPrice: 1800 },
        { name: "Portapilas con interruptor", quantity: 1, unitPrice: 900 },
      ],
      paintAmount: 800,
    }),
  }),

  // ── Cuadros y Organizadores ──────────────────────────────────────────
  createProduct({
    title: "Árbol de la Vida 30x30",
    slug: "arbol-de-la-vida-30x30",
    shortDescription:
      "Cuadro calado de un árbol de la vida en capas de MDF, 30x30 cm.",
    fullDescription:
      "Cuadro decorativo calado con diseño de árbol de la vida, armado en capas de MDF para generar profundidad. Se cuelga con ojal trasero. Combina con cualquier ambiente y es un regalo clásico.",
    categories: ["cuadros-y-organizadores"],
    topics: ["cuadros", "hogar", "regalos"],
    specifications: {
      material: "MDF 3mm (2 capas) + fondo 5mm",
      dimensions: "30x30 cm",
      thickness: "1.5cm",
      hasLighting: false,
      powerSource: "ninguno",
      heightCm: 30,
      widthCm: 30,
      depthCm: 1.5,
      finish: "Pintado / Madera natural",
      customizable: false,
    },
    price: 13500,
    weightGrams: 400,
    dimensions: { heightCm: 30, widthCm: 30, lengthCm: 2 },
    costQuote: createCostQuote({
      wood: { widthCm: 30, lengthCm: 60, face: "natural" },
      machineMinutes: 30,
      laborMinutes: 30,
      accessories: [{ name: "Ojal para colgar", quantity: 1, unitPrice: 100 }],
      paintAmount: 700,
    }),
  }),
  createProduct({
    title: "Portallaveros de 5 Ganchos",
    slug: "portallaveros-de-5-ganchos",
    shortDescription:
      "Portallaveros de pared de MDF con 5 ganchos metálicos.",
    fullDescription:
      "Portallaveros de pared en MDF calado con 5 ganchos metálicos. Se fija con tarugos o cinta de doble contacto. Mantiene llaves, correas y accesorios ordenados en la entrada de casa.",
    categories: ["cuadros-y-organizadores"],
    topics: ["organizadores", "hogar", "utilitarios"],
    specifications: {
      material: "MDF 9mm",
      dimensions: "30x10 cm",
      thickness: "9mm",
      hasLighting: false,
      powerSource: "ninguno",
      heightCm: 10,
      widthCm: 30,
      depthCm: 0.9,
      finish: "Barnizado / Pintado",
      customizable: true,
    },
    price: 8500,
    weightGrams: 300,
    dimensions: { heightCm: 10, widthCm: 30, lengthCm: 4 },
    costQuote: createCostQuote({
      wood: { widthCm: 30, lengthCm: 10, face: "natural" },
      machineMinutes: 10,
      laborMinutes: 15,
      accessories: [{ name: "Gancho metálico", quantity: 5, unitPrice: 250 }],
      paintAmount: 300,
    }),
  }),

  createProduct({
    title: "Portaretrato Decorativo para Foto 10x15",
    slug: "portaretrato-decorativo-10x15",
    shortDescription:
      "Portaretrato de MDF para foto de 10x15 cm, para apoyar o colgar.",
    fullDescription:
      "Portaretrato decorativo en MDF para foto de 10x15 cm, con marco calado, vidrio frontal y soporte trasero para apoyar en mesa o estante (también se puede colgar). Se personaliza con nombre, frase o diseño temático. Un regalo clásico para el hogar.",
    categories: ["cuadros-y-organizadores"],
    topics: ["portaretrato", "decoracion", "fotos", "hogar"],
    specifications: {
      material: "MDF 3mm + base 9mm",
      dimensions: "18x23 cm (foto de 10x15 cm)",
      thickness: "1.2cm",
      hasLighting: false,
      powerSource: "ninguno",
      heightCm: 23,
      widthCm: 18,
      depthCm: 1.2,
      finish: "Pintado / Barnizado",
      customizable: true,
    },
    price: 9800,
    weightGrams: 280,
    dimensions: { heightCm: 23, widthCm: 18, lengthCm: 4 },
    costQuote: createCostQuote({
      wood: { widthCm: 30, lengthCm: 25, face: "natural" },
      machineMinutes: 18,
      laborMinutes: 25,
      accessories: [
        { name: "Vidrio 10x15", quantity: 1, unitPrice: 900 },
        { name: "Ojal para colgar", quantity: 1, unitPrice: 100 },
      ],
      paintAmount: 600,
    }),
  }),

  createProduct({
    title: "Medallero Deportivo Personalizado",
    slug: "medallero-deportivo",
    shortDescription:
      "Medallero de MDF con nombre y deporte a elección para colgar las medallas.",
    fullDescription:
      "Medallero de pared en MDF calado, personalizado con el nombre del deportista y la disciplina (fútbol, hockey, natación, running y más). Tiene ganchos para colgar las medallas y se fija a la pared con tarugos o cinta de doble contacto. Un regalo ideal para quienes juntan trofeos y medallas.",
    categories: ["cuadros-y-organizadores"],
    topics: ["deportes"],
    specifications: {
      material: "MDF 9mm + calado MDF 3mm",
      dimensions: "30x20 cm",
      thickness: "1.2cm",
      hasLighting: false,
      powerSource: "ninguno",
      heightCm: 20,
      widthCm: 30,
      depthCm: 1.2,
      finish: "Pintado a mano / Barnizado",
      customizable: true,
    },
    price: 16500,
    weightGrams: 450,
    dimensions: { heightCm: 20, widthCm: 30, lengthCm: 3 },
    costQuote: createCostQuote({
      wood: { widthCm: 40, lengthCm: 30, face: "natural" },
      machineMinutes: 20,
      laborMinutes: 30,
      accessories: [{ name: "Gancho metálico", quantity: 6, unitPrice: 250 }],
      paintAmount: 700,
    }),
  }),
  createProduct({
    title: "Cuadro Camiseta con Nombre y Número",
    slug: "cuadro-camiseta",
    shortDescription:
      "Cuadro con la silueta de una camiseta, personalizado con nombre y número.",
    fullDescription:
      "Cuadro de MDF calado con la silueta de una camiseta de fútbol (u otro deporte), personalizado con el nombre y el número del jugador y los colores de su equipo. Se arma en capas para dar relieve y se cuelga con ojal trasero. Un regalo ideal para hinchas y deportistas.",
    categories: ["cuadros-y-organizadores"],
    topics: ["deportes", "futbol"],
    specifications: {
      material: "MDF 3mm (capas) + fondo 5mm",
      dimensions: "30x30 cm",
      thickness: "1.5cm",
      hasLighting: false,
      powerSource: "ninguno",
      heightCm: 30,
      widthCm: 30,
      depthCm: 1.5,
      finish: "Pintado a mano / Barnizado",
      customizable: true,
    },
    price: 14800,
    weightGrams: 380,
    dimensions: { heightCm: 30, widthCm: 30, lengthCm: 2 },
    costQuote: createCostQuote({
      wood: { widthCm: 30, lengthCm: 60, face: "natural" },
      machineMinutes: 28,
      laborMinutes: 35,
      accessories: [{ name: "Ojal para colgar", quantity: 1, unitPrice: 100 }],
      paintAmount: 900,
    }),
  }),

  // ── Infantil y Bebés ─────────────────────────────────────────────────
  createProduct({
    title: "Cartel de Recién Nacido",
    slug: "cartel-de-recien-nacido",
    shortDescription:
      "Cartel calado con el nombre del bebé para la puerta del cuarto o la clínica.",
    fullDescription:
      "Cartel calado con el nombre del bebé, pensado para la puerta de la habitación o la clínica. Personalizable con colores y detalles (estrellas, nubes, animalitos). Se cuelga con cinta de raso.",
    categories: ["infantil-y-bebes"],
    topics: ["maternidad", "bebes", "personalizado"],
    specifications: {
      material: "MDF 3mm",
      dimensions: "35x25 cm",
      thickness: "3mm",
      hasLighting: false,
      powerSource: "ninguno",
      heightCm: 25,
      widthCm: 35,
      finish: "Pintado a mano",
      customizable: true,
    },
    price: 12500,
    weightGrams: 220,
    dimensions: { heightCm: 25, widthCm: 35, lengthCm: 1 },
    costQuote: createCostQuote({
      wood: { widthCm: 35, lengthCm: 25, face: "white" },
      machineMinutes: 15,
      laborMinutes: 25,
      accessories: [{ name: "Cinta de raso", quantity: 1, unitPrice: 300 }],
      paintAmount: 600,
    }),
  }),
  createProduct({
    title: "Letra Plana 14x14",
    slug: "letra-plana-14x14",
    shortDescription:
      "Letra plana de MDF de 14x14 cm para decorar el cuarto del bebé.",
    fullDescription:
      "Letra plana en MDF de 14x14 cm, a elección, para decorar el cuarto o armar el nombre del bebé. Se vende por unidad y se puede pintar del color que elijas. Se apoya o se cuelga.",
    categories: ["infantil-y-bebes"],
    topics: ["letras", "bebes", "decoracion"],
    specifications: {
      material: "MDF 9mm",
      dimensions: "14x14 cm",
      thickness: "9mm",
      hasLighting: false,
      powerSource: "ninguno",
      heightCm: 14,
      widthCm: 14,
      depthCm: 0.9,
      finish: "Pintado / Madera natural",
      customizable: true,
    },
    price: 2800,
    quantityPrices: [
      { quantity: 5, price: 12500 },
      { quantity: 10, price: 24000 },
    ],
    weightGrams: 90,
    dimensions: { heightCm: 14, widthCm: 14, lengthCm: 1 },
    costQuote: createCostQuote({
      wood: { widthCm: 14, lengthCm: 14, face: "natural" },
      machineMinutes: 4,
      laborMinutes: 5,
      paintAmount: 200,
    }),
  }),
];
