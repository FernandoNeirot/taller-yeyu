import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

type FeaturedProductCardProps = {
  product: Product;
  href: string;
  compact?: boolean;
  carousel?: boolean;
};

export function FeaturedProductCard({
  product,
  href,
  compact = false,
  carousel = false,
}: FeaturedProductCardProps) {
  const sizeStyle = compact
    ? { minWidth: 168, width: 168 }
    : carousel
      ? { minWidth: 220, width: 220 }
      : { width: "100%" };

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-high transition-transform duration-300 hover:-translate-y-0.5"
      style={sizeStyle}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          alt={product.title}
          src={product.featuredImage}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={compact ? "168px" : "(min-width: 768px) 25vw, 50vw"}
          unoptimized
        />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3
          className={
            compact
              ? "font-headline-md text-headline-md text-on-surface leading-tight line-clamp-2"
              : "font-headline-md text-headline-md text-on-surface leading-tight line-clamp-2"
          }
        >
          {product.title}
        </h3>
        {compact ? null : (
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 line-clamp-2">
            {product.shortDescription}
          </p>
        )}
      </div>
    </Link>
  );
}
