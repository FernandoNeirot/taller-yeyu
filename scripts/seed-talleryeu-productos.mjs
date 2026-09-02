import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const COLLECTION = "talleryeu-productos";

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const products = [
  {
    title: "Kits de Bienvenida",
    description: "Piezas únicas cortadas a láser para celebrar nuevas vidas.",
    category: "kits",
    tag: "Kits",
    alt: "Taller Yeyu Kits de Bienvenida",
    image:
      "https://lh3.googleusercontent.com/aida/AEtjO1XpZksR7sB4weVe7JsnjD4OEfWH8vSZPPFfIhduWv5sg7gBHCRfO5epgfAOcLnueCAFj81f80tdMGeOvFf7OtsTJLx2i341UhDn_fP3KZSMDsCvA9UFDFNPdxSEYwaVnBupkUqcvS_20RFdTXW2S85ywyQcCSEcPjLKbPzlsTd16KnGC0vGqH7xeklAeBH7zG4Jzarv9GVkGEY8vSVjFELxqoSTY-CMkmLMWPGl7X6vEjTnEaJ3jJellyY",
    material: "Madera",
    finish: "Corte láser",
    featured: true,
  },
  {
    title: "Veladores Geométricos",
    description: "Iluminación cálida con cortes precisos en madera.",
    category: "iluminacion",
    tag: "Iluminación",
    alt: "Veladores Geométricos premium wood lighting",
    image:
      "https://lh3.googleusercontent.com/aida/AEtjO1XkWecc9_LhyLt4Wjrv6wSkBLoMz144x8SW9x1-5YO2ycZLAkFW_SOOkj81v66l63RCuk2GOE5p_OD_MtucSag5rSXArI3yN2Qd_2nAJE8vhcyqcE3XG5YSAAyHNScnuNKPBy0DssjQigptKN6QXHdDQT3HE6IXOv5x6-4vcjwouUsvLdvKq2tefu9xTds6MVL6JxVbwLvOsHXRyRtXivICQdD214IobxbguNuodRacpR9ka1GeuqCl4Pw",
    material: "Madera",
    finish: "Corte láser e iluminación LED",
  },
  {
    title: "Cajitas de Recuerdo",
    description: "Souvenirs de madera para que tu evento sea inolvidable.",
    category: "souvenirs",
    tag: "Souvenirs",
    alt: "Cajitas de Souvenir intricately cut wood",
    image:
      "https://lh3.googleusercontent.com/aida/AEtjO1VXulbQkWTyv8sh5TJ9m3DcosSVXvKF3ZVJjzcJqXgoSYJv0VrN7DA5E8fAJQfd89SQXigie6ptapJWMm-9b3jDUlD4raBWj-duADjgmyvdrzb_FDMFACxr_iG_wiTiQ6qFQrBShj1MlJfyyH5TOajA_WD1Zm_BWEWwa_7Wlb4MOD5a_BcrGmbhTWYQWc9dctR1aY9l_2ud2FEX3aM2pr9rofCiGL5ztEJzKNaRx-IlFlq-JjBE2dovyXw",
    material: "Madera",
    finish: "Corte láser",
  },
  {
    title: "Diseño Héroes",
    description: "Temática infantil con personajes y recortes personalizados.",
    category: "souvenirs",
    tag: "Souvenirs",
    alt: "Temática Infantil 1",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAfzL_HwtelQUqSWeLEZEhTb4LgZVzTluZndbVge7SMDlY4PxmLo8UmVLGZHMZOA22wg1BANQzZ6nlE8AdMk9PqUBh1FJ97rHh_mLUNkkN2JyHZtFG6FDe_EM86GwZEVTTtlcTsWOurH_i8sJO0ZrV_U5aHSkTcTnk9YhLihBpUop_tbEs4-hOyRj4WVWFRVML72gG2l_9EYWsoDASxV9DG0g5Bo9SMSA3jUSGHXLxP6utOlcQmcR635cSYPeK4uBBRSA",
    material: "Madera",
    finish: "Corte láser personalizado",
  },
  {
    title: "Mundo Mágico",
    description: "Piezas temáticas para habitaciones y momentos en familia.",
    category: "kits",
    tag: "Kits",
    alt: "Temática Infantil 2",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBuZVJr7dhzbqSI2ZamQcXIWfuZv_ul2I4UGKg_ZY2fcpIC8Ogf0FhA5GTfzxzKY3Xh2lUEd0qnKpoTtzMrei_OL2I70VVf8MMti4Z94YmvSkbftQragtkFWkZKmIJbVOxQz-MPu6ddwFD5Z27EBEGxUCRo42kZAj8d4VVUdfjGucjFzirq8z2h8XTdtzSfRGbNARFdsSV9EstxnZePWU-Ce99ROFklfZdNRuFcBQ2P6ybd3FsMNrngPX-BHPnrcI2vUg",
    material: "Madera",
    finish: "Corte láser",
  },
  {
    title: "Aventura Espacial",
    description: "Diseños infantiles con recortes láser y luz cálida.",
    category: "iluminacion",
    tag: "Iluminación",
    alt: "Temática Infantil 3",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDXtqBBWMTFqJ2iEOiU1RMN1JNimLDK_xS5-Z9lt0AY0bWsiHnw52WZPa-h_POMOV1GHGE7yBnHS5DP1n_RBpJmC_rjtxz6IxZRFyGJzGEmgl5K6sCeCM9gHJ2iuwHf9NhuwnZ0lx4OArwWvsmL97gxRwfasqbodQcQdo0Xl-bMUDXJW8_hAzzfWLhLrVJyFq7zsy7vdom_iP_k6STAGR7PO4nn6PZ_-OTk_GdGSOF_97Zp8sUf2PYjQV9fBfJ7jh_gzA",
    material: "Madera",
    finish: "Corte láser e iluminación LED",
  },
  {
    title: "Lámparas Personalizadas",
    description: "Luz cálida con tu nombre y diseño favorito.",
    category: "iluminacion",
    tag: "Iluminación",
    alt: "Lámparas Personalizadas glowing warm light",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBAapKZGhAxZOAcntsqsobhvwieVxetZtrXgTPZs9i98sRtPxV_lxeBt1K4nYyZpCuQZl7gNOZrNE-TenrEm7mxF1pbf460UKmUcQcTLS716gB_KhcsIZ3xE5iFbBjJn8JUdGKsXun2zDfj_7sGqCRnVTB9pWNiQSpK60rH6E8vqfVsvJVYwJPD2dbYYyiMHavWXBtzz0oXjobaDiEJuPw-EN-n-EUPwDcclgms4R2OqlUQcUT7HNMygrKs5hVr5DwtTQ",
    material: "Madera",
    finish: "Corte láser e iluminación LED",
    featured: true,
  },
  {
    title: "Detalle de Lámpara",
    description: "Cortes finos y siluetas que cobran vida con la luz.",
    category: "iluminacion",
    tag: "Iluminación",
    alt: "Detail of custom lamp cutouts",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC9RRZ3oS7CyWyy40N1WFv3YyZbS1vlCK3msbNVuSVRMwI_yxVj8mYbnKo6YmDTYnRCOM7kVDUEh57LpVaW_QGDcqwS4qG01gB5aeiWlIHWOJYDjoy4WlKmkf6d-IzZDGcPzThSkQse4N30kD3uZVSSVI_7uhz-h7DIHzjeKJjrr-FyRP8TtxjALRWtUyWO_TbXmWn_M7Vq_FBbun7CeEGXA95sTOnUhYZ3d1Z4TZwYr7_CqfiXAiPmNmajqGUopz3c2A",
    material: "Madera",
    finish: "Corte láser",
  },
  {
    title: "Kits para Pintar",
    description: "Figuras de madera con acuarelas para crear en familia.",
    category: "kits",
    tag: "Kits",
    alt: "Kits para Pintar artisan craft kit",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAbWJcYk8CfHebyFnILSbjf0PEmvAglQWegifWmfigvAKWesQY01xF8xno0yShVJEA-ZjxID_W5pwHoyejYbeJYNJuCtGHP_viRjVUaIN5Us6rzoqcJtVbXoj8N_i193GIRfKYK2mhOrmsjEMfNxPn0mN2-DfKWd-SADkCnnS_OpTGTuB1vfbaBpclJVXaHGZX7P-ZTyud4UJxV20fPVlgbKrFQTt3nc_l9ptJp3Ifim-pf92WZssgn8RaYJ6y97zr4BQ",
    material: "Madera y acuarelas",
    finish: "Kit para pintar",
  },
];

function getPrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) {
    throw new Error("Falta FIREBASE_PRIVATE_KEY");
  }
  return key.replace(/\\n/g, "\n");
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: getPrivateKey(),
    }),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();
const now = FieldValue.serverTimestamp();

for (const product of products) {
  const slug = slugify(product.title);
  await db.collection(COLLECTION).doc(slug).set(
    {
      ...product,
      slug,
      images: product.images ?? [],
      customizable: true,
      featured: Boolean(product.featured),
      available: true,
      stock: null,
      price: null,
      currency: "ARS",
      searchText: `${product.title} ${product.description} ${product.tag} ${product.category}`.toLowerCase(),
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  );
  console.log(`upsert ${slug}`);
}

const count = await db.collection(COLLECTION).count().get();
console.log(`colección ${COLLECTION}: ${count.data().count} documentos`);
