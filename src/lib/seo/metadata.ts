import type { Metadata } from "next";
import { getShareImage, siteConfig, type ShareImage } from "./site";

type SharePageOptions = {
  title: string;
  description: string;
  path: string;
  images?: ShareImage[];
  keywords?: string[];
};

export function shareImages(images?: ShareImage[]) {
  return images?.length ? images : [getShareImage()];
}

export function sharePageMetadata({
  title,
  description,
  path,
  images,
  keywords,
}: SharePageOptions): Metadata {
  const socialImages = shareImages(images);
  const socialTitle = title.includes(siteConfig.name)
    ? title
    : `${title} | ${siteConfig.name}`;

  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title: socialTitle,
      description,
      url: path,
      images: socialImages,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: socialImages,
    },
  };
}
