import Image from "next/image";

type LogoProps = {
  className?: string;
  priority?: boolean;
  alt?: string;
};

export function Logo({
  className,
  priority = false,
  alt = "Taller Yeyu",
}: LogoProps) {
  return (
    <Image
      src="/brand/logo-dark.webp"
      alt={alt}
      width={208}
      height={196}
      className={className}
      sizes="(min-width: 768px) 208px, 144px"
      style={{ width: "auto" }}
      priority={priority}
    />
  );
}
