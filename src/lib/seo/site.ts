export const PRODUCTION_SITE_URL = "https://talleryeyu.com";

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
  ogImagePath: "/og.png",
  category: "shopping",
} as const;

export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (
    fromEnv &&
    !fromEnv.includes("localhost") &&
    !fromEnv.includes("127.0.0.1") &&
    !fromEnv.includes("vercel.app")
  ) {
    return fromEnv;
  }

  return PRODUCTION_SITE_URL;
}

export function getShareImage() {
  return {
    url: absoluteUrl(siteConfig.ogImagePath),
    secureUrl: absoluteUrl(siteConfig.ogImagePath),
    width: 1200,
    height: 630,
    type: "image/png",
    alt: siteConfig.name,
  };
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
