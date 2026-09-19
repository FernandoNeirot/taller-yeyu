import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/features/products/components/product-detail";
import {
  productHref,
  productShareImage,
} from "@/features/products/lib/product-url";
import { getCatalogProduct } from "@/features/products/services/get-catalog-products";
import { JsonLd, getProductJsonLd } from "@/lib/seo/json-ld";
import { sharePageMetadata } from "@/lib/seo/metadata";
import { categoryLabel } from "@/types/product";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);

  if (!product) {
    return {
      title: "Producto no encontrado",
      robots: { index: false, follow: false },
    };
  }

  return sharePageMetadata({
    title: product.title,
    description: product.shortDescription || product.fullDescription,
    path: productHref(product.slug),
    images: [productShareImage(product)],
    keywords: [
      product.title,
      ...product.categories.map(categoryLabel),
      ...product.topics,
    ],
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="w-full">
      <JsonLd data={getProductJsonLd(product)} />
      <ProductDetail product={product} />
    </main>
  );
}
