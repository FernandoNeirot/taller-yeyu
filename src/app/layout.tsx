import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { DeferredMaterialSymbols } from "@/components/ui/deferred-material-symbols";
import { JsonLd, getSiteJsonLd } from "@/lib/seo/json-ld";
import { shareImages } from "@/lib/seo/metadata";
import {
  getGoogleVerification,
  getSiteUrl,
  siteConfig,
} from "@/lib/seo/site";
import "./globals.css";
import { Providers } from "./providers";

const manrope = Manrope({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-manrope",
  display: "swap",
  preload: false,
  adjustFontFallback: true,
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
    images: shareImages(),
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: shareImages(),
  },
  appleWebApp: {
    title: siteConfig.name,
    statusBarStyle: "black-translucent",
    capable: true,
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" }],
    shortcut: "/favicon.ico",
  },
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`dark ${manrope.variable} h-full`}
    >
      <body className="min-h-full antialiased bg-background text-on-background">
        <DeferredMaterialSymbols />
        <JsonLd data={getSiteJsonLd()} />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
