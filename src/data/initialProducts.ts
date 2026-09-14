import type { Product } from "@/types/product";

const PLACEHOLDER_IMAGE = "/principal.png";
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

export const initialProducts: Product[] = [
  createProduct({
    title: "Velador Temático LED",
    slug: "velador-tematico-led",
    shortDescription:
      "Velador calado con silueta de personaje o figura a elección e iluminación LED interior.",
    fullDescription:
      "Velador calado con silueta de personaje o figura a elección. Diseñado en espesor de 2 cm para albergar tiras o luces LED interiores, creando una iluminación ambiental cálida y mágica.",
    categories: ["decoracion-hogar", "infantil-ninos", "regalos-especiales"],
    topics: ["infantil", "personajes", "iluminacion"],
    specifications: {
      material: "MDF 18/20mm + calado MDF 3mm",
      dimensions: "20x20 cm aprox.",
      finish: "Barnizado / Pintado",
      customizable: true,
    },
    galleryImages: ["/principal.png", "/og.png"],
    price: 22500,
  }),
  createProduct({
    title: "Kit Creativo de Figuras para Pintar",
    slug: "kit-creativo-de-figuras-para-pintar",
    shortDescription:
      "Set didáctico con figuras de MDF listas para colorear e incluir paleta o fibras.",
    fullDescription:
      "Set didáctico e interactivo que incluye varias figuras en MDF de diferentes tamaños listas para colorear. Incluye paleta de acuarelas o fibras para estimular la creatividad.",
    categories: ["infantil-ninos", "regalos-especiales"],
    topics: ["actividades-infantiles", "arte", "cumpleanos"],
    specifications: {
      material: "MDF 3mm",
      dimensions: "Figuras de 5 a 15 cm",
      finish: "MDF Crudo blanco de lijado fino",
      customizable: false,
    },
  }),
  createProduct({
    title: "Llaveros Personalizados",
    slug: "llaveros-personalizados",
    shortDescription:
      "Llaveros calados o grabados con nombres, formas o logos para recuerdos y merchandising.",
    fullDescription:
      "Llaveros calados o grabados con nombres, formas o logos. Ideal para recuerdos masivos o regalos corporativos.",
    categories: ["eventos-souvenirs", "regalos-especiales"],
    topics: ["souvenirs", "merchandising", "personalizado"],
    specifications: {
      material: "MDF 3mm o Acrílico",
      dimensions: "5x5 cm aprox.",
      finish: "Grabado láser",
      customizable: true,
    },
  }),
  createProduct({
    title: "Set Portallaves de Pared con Llaveros Encajables",
    slug: "set-portallaves-de-pared-con-llaveros-encajables",
    shortDescription:
      "Placa de pared para colgar llaves con llaveros individuales de formas encajables.",
    fullDescription:
      "Placa decorativa de pared para colgar llaves que incluye llaveros individuales con formas encajables (pareja, familia o formas geométricas).",
    categories: ["decoracion-hogar", "organizadores-utilitarios"],
    topics: ["hogar", "organización", "familia"],
    specifications: {
      material: "MDF 6mm (base) + 3mm (llaveros)",
      dimensions: "20x15 cm",
      finish: "Encastre de precisión",
      customizable: true,
    },
  }),
  createProduct({
    title: "Caja Multiuso con Frases Emotivas",
    slug: "caja-multiuso-con-frases-emotivas",
    shortDescription:
      "Caja calada con tapa grabada con mensajes emotivos o frase personalizada.",
    fullDescription:
      "Caja calada con tapas grabadas con mensajes como 'Feliz Cumpleaños', 'Te Amo', 'Juntos a la Par' o frase personalizada a elección.",
    categories: ["regalos-especiales", "eventos-souvenirs"],
    topics: ["amor", "cumpleanos", "frases"],
    specifications: {
      material: "MDF 3mm",
      dimensions: "15x15x10 cm",
      finish: "Cierre de encastre perfecto",
      customizable: true,
    },
  }),
  createProduct({
    title: "Caja Calada Multiuso (Lapicero / Souvenir)",
    slug: "caja-calada-multiuso-lapicero-souvenir",
    shortDescription:
      "Cajita versátil con frente calado, disponible en tamaño souvenir o lapicero.",
    fullDescription:
      "Cajita versátil con la cara frontal calada según el evento o uso. Disponible en dos tamaños (Chico para souvenir / Grande para lapicero de escritorio).",
    categories: [
      "eventos-souvenirs",
      "organizadores-utilitarios",
      "infantil-ninos",
    ],
    topics: ["souvenirs", "escritorio", "candy-bar"],
    specifications: {
      material: "MDF 3mm",
      dimensions: "Chico (7x7x7 cm) / Grande (10x10x12 cm)",
      finish: "Encastrable",
      customizable: true,
    },
  }),
  createProduct({
    title: "Cuadro Calado Artístico",
    slug: "cuadro-calado-artistico",
    shortDescription:
      "Cuadro de diseño moderno calado en alta precisión para paredes de living o dormitorio.",
    fullDescription:
      "Cuadro de diseño moderno calado en alta precisión. Perfecto para dar vida y estilo a paredes de livings, dormitorios o pasillos.",
    categories: ["decoracion-hogar"],
    topics: ["arte", "living", "minimalista"],
    specifications: {
      material: "MDF 3mm / 6mm",
      dimensions: "30x40 cm",
      finish: "Pintura negra mate / madera natural",
      customizable: false,
    },
  }),
  createProduct({
    title: "Portarretrato Calado para Fotos",
    slug: "portarretrato-calado-para-fotos",
    shortDescription:
      "Portarretrato de sobremesa o pared para fotos familiares o de mascotas.",
    fullDescription:
      "Portarretrato de sobremesa o pared diseñado para fotos familiares o con temática de mascotas (huellitas, nombres calados).",
    categories: ["decoracion-hogar", "regalos-especiales"],
    topics: ["familia", "mascotas", "recuerdos"],
    specifications: {
      material: "MDF 3mm superpuesto",
      dimensions: "Para fotos 10x15 cm o 13x18 cm",
      finish: "Ensamblado bicapa",
      customizable: true,
    },
  }),
  createProduct({
    title: "Frase Decorativa en MDF Troquelado",
    slug: "frase-decorativa-en-mdf-troquelado",
    shortDescription:
      "Palabras o frases caladas en tipografías cursivas o modernas para pared o repisa.",
    fullDescription:
      "Palabras o frases caladas en tipografías cursivas o modernas para pegar en la pared o apoyar en repisas.",
    categories: ["decoracion-hogar"],
    topics: ["frases", "tipografia", "hogar"],
    specifications: {
      material: "MDF 5mm o 6mm",
      dimensions: "Ancho de 40 cm a 80 cm",
      finish: "Pintado o crudo",
      customizable: true,
    },
  }),
  createProduct({
    title: "Cartel Redondo de Pared (Bienvenida / Iniciales)",
    slug: "cartel-redondo-de-pared-bienvenida-iniciales",
    shortDescription:
      "Círculo calado con nombre, inicial o 'Bienvenidos' y temática personalizada.",
    fullDescription:
      "Círculo calado con nombre, inicial o la palabra 'Bienvenidos' con temática personalizada (animales, botánico, estrellas).",
    categories: [
      "infantil-ninos",
      "decoracion-hogar",
      "eventos-souvenirs",
    ],
    topics: ["maternidad", "bebes", "bienvenida"],
    specifications: {
      material: "MDF 3mm / 6mm",
      dimensions: "28 x 28 cm",
      finish: "Superposición de capas",
      customizable: true,
    },
  }),
  createProduct({
    title: "Centro de Mesa Temático",
    slug: "centro-de-mesa-tematico",
    shortDescription:
      "Estructura auto-portante para comuniones, bodas, 15 años o cumpleaños infantiles.",
    fullDescription:
      "Estructura auto-portante para encastrar con bases estables. Diseños adaptados para comuniones, bodas, 15 años o cumpleaños infantiles.",
    categories: ["eventos-souvenirs"],
    topics: ["comunion", "cumpleanos", "casamientos", "fiestas"],
    specifications: {
      material: "MDF 3mm",
      dimensions: "20 a 25 cm de alto",
      finish: "Desmontable para fácil transporte",
      customizable: true,
    },
  }),
  createProduct({
    title: "Cuadro Wall Art Geométrico",
    slug: "cuadro-wall-art-geometrico",
    shortDescription:
      "Paneles calados con patrones geométricos y abstractos para paredes principales.",
    fullDescription:
      "Paneles calados con patrones geométricos y abstractos, ideales para aportar textura y sombras a paredes principales.",
    categories: ["decoracion-hogar"],
    topics: ["geometrico", "moderno", "living"],
    specifications: {
      material: "MDF 6mm",
      dimensions: "40x60 cm",
      finish: "Negro mate o satinado",
      customizable: false,
    },
  }),
  createProduct({
    title: "Cuadro 3D con Panel Frontal y Relieve",
    slug: "cuadro-3d-con-panel-frontal-y-relieve",
    shortDescription:
      "Obra en relieve con fondo, panel frontal calado y separadores internos.",
    fullDescription:
      "Obra en relieve compuesta por fondo, panel frontal calado y separadores internos que generan un efecto tridimensional.",
    categories: ["decoracion-hogar"],
    topics: ["arte-3d", "capas", "profundidad"],
    specifications: {
      material: "MDF 3mm multidensa",
      dimensions: "30x30 cm",
      finish: "Armado multicapa",
      customizable: false,
    },
  }),
  createProduct({
    title: "Caja Organizadora Porta Té con Tapa",
    slug: "caja-organizadora-porta-te-con-tapa",
    shortDescription:
      "Caja con compartimentos internos y tapa calada para saquitos de té.",
    fullDescription:
      "Caja organizadora con compartimentos internos y tapa calada decorativa para guardar saquitos de té ordenadamente.",
    categories: ["organizadores-utilitarios", "decoracion-hogar"],
    topics: ["cocina", "organización", "te"],
    specifications: {
      material: "MDF 3mm",
      dimensions: "22x16x9 cm",
      finish: "Tapa con bisagra de encastre",
      customizable: true,
    },
  }),
  createProduct({
    title: "Adorno Mural Bicapa Profundidad",
    slug: "adorno-mural-bicapa-profundidad",
    shortDescription:
      "Pieza de pared en dos capas contrapuestas para contraste visual y profundidad.",
    fullDescription:
      "Pieza decorativa de pared compuesta por dos capas contrapuestas de colores o tonos de madera distintos para lograr contraste visual.",
    categories: ["decoracion-hogar"],
    topics: ["naturaleza", "paisajes", "capas"],
    specifications: {
      material: "MDF 3mm (doble capa = 6mm)",
      dimensions: "35 cm de diámetro",
      finish: "Combinación de tonos",
      customizable: false,
    },
  }),
  createProduct({
    title: "Organizador Multiuso de Escritorio",
    slug: "organizador-multiuso-de-escritorio",
    shortDescription:
      "Módulo con divisiones para lápices, notas, celular y útiles de oficina.",
    fullDescription:
      "Módulo con divisiones para lápices, notas, teléfono celular y útiles de oficina. Mantiene tu espacio de trabajo despejado.",
    categories: ["organizadores-utilitarios"],
    topics: ["oficina", "escritorio", "estudio"],
    specifications: {
      material: "MDF 3mm reforzado",
      dimensions: "25x15x12 cm",
      finish: "Encastrable auto-armable",
      customizable: true,
    },
  }),
  createProduct({
    title: "Sistema de Separadores de Cajón Modulares",
    slug: "sistema-de-separadores-de-cajon-modulares",
    shortDescription:
      "Tiras ranuradas de MDF que se encastran para adaptar cualquier cajón.",
    fullDescription:
      "Tiras ranuradas de MDF que se encastran entre sí para adaptar los espacios de cualquier cajón según tus necesidades.",
    categories: ["organizadores-utilitarios"],
    topics: ["cocina", "placard", "organización"],
    specifications: {
      material: "MDF 3mm duradero",
      dimensions: "Tiras de 40 cm ajustables",
      finish: "Ranuras de acople rápido",
      customizable: false,
    },
  }),
  createProduct({
    title: "Porta Servilletas Decorativo",
    slug: "porta-servilletas-decorativo",
    shortDescription:
      "Servilletero vertical u horizontal con cortes estilizados para la mesa.",
    fullDescription:
      "Servilletero vertical u horizontal con cortes estilizados que combinan funcionalidad y estética en tu mesa.",
    categories: ["organizadores-utilitarios", "decoracion-hogar"],
    topics: ["cocina", "mesa", "gastronomia"],
    specifications: {
      material: "MDF 3mm",
      dimensions: "14x12x5 cm",
      finish: "Encastre estable",
      customizable: true,
    },
  }),
  createProduct({
    title: "Porta Llaves / Ganchera Rustica de Cocina",
    slug: "porta-llaves-ganchera-rustica-de-cocina",
    shortDescription:
      "Ganchera de pared para cocina u hogar, con ganchos para llaves o utensilios.",
    fullDescription:
      "Ganchera de pared con diseño para cocina u hogar, equipada con ganchos resistentes para llaves, repasas o utensilios.",
    categories: ["organizadores-utilitarios", "decoracion-hogar"],
    topics: ["cocina", "ganchos", "utilitario"],
    specifications: {
      material: "MDF 6mm",
      dimensions: "25x12 cm",
      finish: "Con ganchos metálicos o en MDF",
      customizable: true,
    },
  }),
  createProduct({
    title: "Rompecabezas Infantil de Encastre (12 Piezas)",
    slug: "rompecabezas-infantil-de-encastre-12-piezas",
    shortDescription:
      "Juego de encastre con marco y bordes suaves, ideal para primera infancia.",
    fullDescription:
      "Juego de encastre con marco y bordes suaves pulidos, ideal para primera infancia y desarrollo de motricidad fina.",
    categories: ["infantil-ninos"],
    topics: ["juegos", "didactico", "infantil"],
    specifications: {
      material: "MDF 3mm en base rígida",
      dimensions: "20x15 cm",
      finish: "Piezas lijadas anti-astillas",
      customizable: true,
    },
  }),
  createProduct({
    title: "Rompecabezas de Siluetas (6 Formas Grandes)",
    slug: "rompecabezas-de-siluetas-6-formas-grandes",
    shortDescription:
      "Rompecabezas estilo Montessori con 6 figuras de animales de gran tamaño.",
    fullDescription:
      "Rompecabezas estilo Montessori con 6 figuras de animales de gran tamaño que se encastran en su tablero correspondiente.",
    categories: ["infantil-ninos"],
    topics: ["animales", "didactico", "montessori"],
    specifications: {
      material: "MDF 6mm",
      dimensions: "30x20 cm",
      finish: "Bordes redondeados",
      customizable: false,
    },
  }),
  createProduct({
    title: "Medidor Infantil de Altura con Riel (5 a 140 cm)",
    slug: "medidor-infantil-de-altura-con-riel",
    shortDescription:
      "Regla medidora de pared ensamblada por tramos para marcar el crecimiento.",
    fullDescription:
      "Regla medidora para pared que se ensambla por tramos mediante riel/encastre superior. Permite marcar la altura del bebé mientras crece.",
    categories: ["infantil-ninos", "decoracion-hogar"],
    topics: ["maternidad", "crecimiento", "dormitorio-infantil"],
    specifications: {
      material: "MDF 3mm / 6mm",
      dimensions: "Tramos armables hasta 140 cm",
      finish: "Escala grabada",
      customizable: true,
    },
  }),
  createProduct({
    title: "Alcancía Temática con Puerta Secreta",
    slug: "alcancia-tematica-con-puerta-secreta",
    shortDescription:
      "Alcancía calada con frente temático y tapa inferior extraíble.",
    fullDescription:
      "Alcancía calada con visil o frente temático. Cuenta con una puerta o tapa inferior de fácil extracción sin romper la pieza.",
    categories: ["infantil-ninos", "regalos-especiales"],
    topics: ["ahorro", "personajes", "regalos"],
    specifications: {
      material: "MDF 3mm + Acrílico cristal",
      dimensions: "15x15x15 cm",
      finish: "Armado rígido",
      customizable: true,
    },
  }),
  createProduct({
    title: "Reloj Didáctico Infantil (Aprendé la Hora)",
    slug: "reloj-didactico-infantil-aprende-la-hora",
    shortDescription:
      "Reloj de madera con números grandes y manecillas móviles para aprender la hora.",
    fullDescription:
      "Reloj de madera con números grandes y manecillas móviles de giro manual para que los niños aprendan la hora jugando.",
    categories: ["infantil-ninos"],
    topics: ["educativo", "escuela", "juegos"],
    specifications: {
      material: "MDF 3mm bicapa",
      dimensions: "22 cm de diámetro",
      finish: "Manecillas sujetas con remache movible",
      customizable: false,
    },
  }),
  createProduct({
    title: "Cake Topper Personalizado (Nombre + Edad)",
    slug: "cake-topper-personalizado-nombre-edad",
    shortDescription:
      "Adorno con pinche para tortas, con el nombre del agasajado y la edad.",
    fullDescription:
      "Adorno con pinche para colocar sobre tortas. Diseñado con el nombre del agasajado y el número de años.",
    categories: ["eventos-souvenirs"],
    topics: ["cumpleanos", "reposteria", "fiestas"],
    specifications: {
      material: "MDF 3mm o Acrílico espejado",
      dimensions: "15 a 20 cm de ancho",
      finish: "Corte fino con pinche integrado",
      customizable: true,
    },
  }),
  createProduct({
    title: "Números Decorativos para Cumpleaños de Décadas",
    slug: "numeros-decorativos-para-cumpleanos-de-decadas",
    shortDescription:
      "Números corpóreos huecos o calados en gran tamaño para mesas de festejo.",
    fullDescription:
      "Números corpóreos huecos o calados en gran tamaño (30, 40, 50, 60), ideales para mesas principales de festejos.",
    categories: ["eventos-souvenirs", "decoracion-hogar"],
    topics: ["cumpleanos", "eventos", "decadas"],
    specifications: {
      material: "MDF 3mm / 6mm con base",
      dimensions: "30 cm de altura",
      finish: "Auto-portante",
      customizable: true,
    },
  }),
  createProduct({
    title: "Set Placa 'Recuerdos' + Souvenir Imantado",
    slug: "set-placa-recuerdos-souvenir-imantado",
    shortDescription:
      "Placa exhibidora 'Recuerdos' junto con souvenir imantado para heladera.",
    fullDescription:
      "Cajita o placa exhibidora decorativa 'Recuerdos' junto con souvenir imantado para heladera con calado conmemorativo.",
    categories: ["eventos-souvenirs", "regalos-especiales"],
    topics: ["souvenirs", "imanes", "recuerdos"],
    specifications: {
      material: "MDF 3mm + Imán flexible en dorso",
      dimensions: "Imán 6x6 cm / Placa 15x10 cm",
      finish: "Grabado alta definición",
      customizable: true,
    },
  }),
];
