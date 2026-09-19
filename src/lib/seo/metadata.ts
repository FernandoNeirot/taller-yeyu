import type { Metadata } from "next";
import { getShareImage, siteConfig, type ShareImage } from "./site";

type SharePageOptions = {
  title: string;
  description: string;
  path: string;
  images?: ShareImage[];
  keywords?: string[];
  robots?: Metadata["robots"];
};

export function shareImages(images?: ShareImage[]) {
  return images?.length ? images : [getShareImage()];
}

export function seoDescription(text: string, max = 158) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function sharePageMetadata({
  title,
  description,
  path,
  images,
  keywords,
  robots,
}: SharePageOptions): Metadata {
  const socialImages = shareImages(images);
  const socialTitle = title.includes(siteConfig.name)
    ? title
    : `${title} | ${siteConfig.name}`;
  const socialDescription = seoDescription(description);

  return {
    title,
    description: socialDescription,
    ...(keywords?.length ? { keywords } : {}),
    alternates: {
      canonical: path,
    },
    ...(robots ? { robots } : {}),
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title: socialTitle,
      description: socialDescription,
      url: path,
      images: socialImages,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: socialDescription,
      images: socialImages,
    },
  };
}
