import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Taller Yeyu - Carpintería Familiar, Alma Artesana",
  description:
    "Somos un emprendimiento familiar dedicado a crear piezas únicas, kits para pintar y souvenirs personalizados que invitan a crear y compartir en familia.",
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
        {children}
      </body>
    </html>
  );
}
