import { getWhatsAppPhoneNumber } from "@/lib/whatsapp";

export const PRODUCTION_SITE_URL = "https://talleryeyu.com";

export const siteConfig = {
  name: "Taller Yeyu",
  shortName: "Yeyu",
  tagline: "Carpintería Familiar, Alma Artesana",
  title: "Taller Yeyu - Carpintería Familiar, Alma Artesana",
  description:
    "Corte láser y carpintería artesanal en Argentina. Souvenirs personalizados, veladores, organizadores y kits para pintar de Taller Yeyu.",
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
    "Argentina",
  ],
  logoPath: "/brand/logo-dark.png",
  ogImagePath: "/og.png",
  category: "shopping",
  instagramUrl: "https://www.instagram.com/taller.yeyu/",
  areaServed: "Argentina",
} as const;

export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (
    fromEnv &&
    !fromEnv.includes("localhost") &&
    !fromEnv.includes("127.0.0.1") &&
    !fromEnv.includes("vercel.app")
  ) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      return PRODUCTION_SITE_URL;
    }
  }

  return PRODUCTION_SITE_URL;
}

export type ShareImage = {
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  type: string;
  alt: string;
};

export function getShareImage(): ShareImage {
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
  const raw = getWhatsAppPhoneNumber();
  return raw ? `+${raw}` : undefined;
}

export function getGoogleVerification() {
  const value = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  if (!value || value === "xxx") {
    return undefined;
  }

  return value;
}
