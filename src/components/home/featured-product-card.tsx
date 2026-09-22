import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

type FeaturedProductCardProps = {
  product: Product;
  href: string;
  compact?: boolean;
};

export function FeaturedProductCard({
  product,
  href,
  compact = false,
}: FeaturedProductCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-high transition-transform duration-300 hover:-translate-y-0.5"
      style={{ width: "100%" }}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          alt=""
          src={product.featuredImage}
          fill
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 767px) 85vw, (min-width: 1024px) 25vw, 50vw"
        />
      </div>
      <div className={compact ? "flex flex-1 flex-col p-2 md:p-3" : "flex flex-1 flex-col p-2.5 md:p-3"}>
        <h3
          className={
            compact
              ? "font-headline-md text-[13px] leading-snug text-on-surface line-clamp-2 md:text-sm md:leading-snug"
              : "font-headline-md text-[13px] leading-snug text-on-surface line-clamp-2 md:text-headline-md md:leading-tight"
          }
        >
          {product.title}
        </h3>
        {compact ? null : (
          <p className="mt-1 hidden font-body-md text-body-md text-on-surface-variant line-clamp-2 sm:block">
            {product.shortDescription}
          </p>
        )}
      </div>
    </Link>
  );
}
