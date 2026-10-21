import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
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

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const googleVerification = getGoogleVerification();

export const viewport: Viewport = {
  themeColor: "#fafaf9",
  colorScheme: "light",
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
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`${playfair.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full font-sans antialiased bg-background text-on-background">
        <DeferredMaterialSymbols />
        <JsonLd data={getSiteJsonLd()} />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
