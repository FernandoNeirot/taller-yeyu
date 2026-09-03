import type { Metadata } from "next";
import { getShareImage, siteConfig } from "./site";

type SharePageOptions = {
  title: string;
  description: string;
  path: string;
  images?: ReturnType<typeof getShareImage>[];
};

export function shareImages(images?: ReturnType<typeof getShareImage>[]) {
  return images?.length ? images : [getShareImage()];
}

export function sharePageMetadata({
  title,
  description,
  path,
  images,
}: SharePageOptions): Metadata {
  const socialImages = shareImages(images);
  const socialTitle = title.includes(siteConfig.name)
    ? title
    : `${title} | ${siteConfig.name}`;

  return {
    title,
    description,
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
