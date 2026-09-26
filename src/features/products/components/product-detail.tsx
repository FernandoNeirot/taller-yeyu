import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import { categoryLabel } from "@/types/product";
import type { Product } from "@/types/product";
import { galleryHref } from "../lib/gallery-url";
import { productMeasureRows } from "../lib/measures";
import { ProductGallery } from "./product-gallery";
import { ProductOffer } from "./product-offer";
import { ShareProductButton } from "./share-product-button";

export function ProductDetail({ product }: { product: Product }) {
  const primaryCategory = product.categories[0];
  const galleryBackHref = galleryHref({
    categoria: primaryCategory,
  });

  return (
    <article className="w-full max-w-6xl mx-auto px-container-margin pb-xl">
      <nav
        aria-label="Migas de pan"
        className="font-body-md text-body-md text-on-surface-variant"
        style={{ paddingTop: "7rem" }}
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-primary">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/galeria" className="hover:text-primary">
              Galería
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-on-surface line-clamp-1">{product.title}</li>
        </ol>
      </nav>

      <Link
        href={galleryBackHref}
        className="touch-target mt-md inline-flex items-center gap-sm font-label-caps text-label-caps tracking-widest text-on-surface-variant uppercase hover:text-primary"
      >
        <MaterialIcon name="arrow_back" className="text-base" />
        Volver a la galería
      </Link>

      <div className="mt-lg grid grid-cols-1 gap-lg lg:grid-cols-2">
        <ProductGallery product={product} />

        <div className="flex flex-col">
          {primaryCategory ? (
            <span className="w-fit rounded-full bg-surface-container px-3 py-1 font-label-caps text-label-caps text-secondary tracking-widest">
              {categoryLabel(primaryCategory)}
            </span>
          ) : null}

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
              {product.title}
            </h1>
            <ShareProductButton
              title={product.title}
              text={product.shortDescription || product.fullDescription}
              slug={product.slug}
            />
          </div>

          <ProductOffer product={product}>
          {product.specifications.customizable ? (
            <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-surface-container px-3 py-1 font-label-caps text-label-caps text-on-surface tracking-widest">
              <MaterialIcon name="draw" className="text-sm" />
              Personalizable
            </span>
          ) : null}

          <p className="mt-4 font-body-lg text-body-lg text-on-surface-variant">
            {product.fullDescription || product.shortDescription}
          </p>

          <dl className="mt-6 space-y-2 font-body-md text-body-md text-on-surface-variant">
            {product.specifications.material ? (
              <div>
                <dt className="inline font-label-caps text-label-caps text-secondary tracking-widest">
                  Material:{" "}
                </dt>
                <dd className="inline">{product.specifications.material}</dd>
              </div>
            ) : null}
            {productMeasureRows(product).map((row) => (
              <div key={row.label}>
                <dt className="inline font-label-caps text-label-caps text-secondary tracking-widest">
                  {row.label}:{" "}
                </dt>
                <dd className="inline">{row.value}</dd>
              </div>
            ))}
            {product.specifications.finish ? (
              <div>
                <dt className="inline font-label-caps text-label-caps text-secondary tracking-widest">
                  Acabado:{" "}
                </dt>
                <dd className="inline">{product.specifications.finish}</dd>
              </div>
            ) : null}
          </dl>
          </ProductOffer>
        </div>
      </div>
    </article>
  );
}
