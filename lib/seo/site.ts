export const siteConfig = {
  name: "Taller Yeyu",
  shortName: "Yeyu",
  tagline: "Carpintería Familiar, Alma Artesana",
  title: "Taller Yeyu - Carpintería Familiar, Alma Artesana",
  description:
    "Somos un emprendimiento familiar dedicado a crear piezas únicas, kits para pintar y souvenirs personalizados que invitan a crear y compartir en familia.",
  locale: "es_AR",
  language: "es-AR",
  keywords: [
    "Taller Yeyu",
    "carpintería artesanal",
    "corte láser",
    "souvenirs personalizados",
    "kits para pintar",
    "veladores de madera",
    "regalos personalizados",
    "madera",
  ],
  logoPath: "/brand/logo-dark.png",
  category: "shopping",
} as const;

export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) {
    return vercel.startsWith("http") ? vercel : `https://${vercel}`;
  }

  return "http://localhost:3000";
}

export function absoluteUrl(path = "/") {
  const url = getSiteUrl();
  if (!path || path === "/") {
    return url;
  }

  return `${url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getTelephone() {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  return raw ? `+${raw}` : undefined;
}

export function getGoogleVerification() {
  const value = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  if (!value || value === "xxx") {
    return undefined;
  }

  return value;
}
