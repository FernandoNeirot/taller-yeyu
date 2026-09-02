import type { Metadata, Viewport } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import { JsonLd, getSiteJsonLd } from "@/lib/seo/json-ld";
import {
  getGoogleVerification,
  getSiteUrl,
  siteConfig,
} from "@/lib/seo/site";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const googleVerification = getGoogleVerification();

export const viewport: Viewport = {
  themeColor: "#131313",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name, url: getSiteUrl() }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: siteConfig.category,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  appleWebApp: {
    title: siteConfig.name,
    statusBarStyle: "black-translucent",
    capable: true,
  },
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`dark ${manrope.variable} ${plusJakartaSans.variable} h-full`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,100..700,0..1,0&display=swap"
        />
      </head>
      <body className="min-h-full antialiased bg-background text-on-background">
        <JsonLd data={getSiteJsonLd()} />
        {children}
      </body>
    </html>
  );
}
