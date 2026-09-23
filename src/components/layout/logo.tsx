type LogoProps = {
  className?: string;
  alt?: string;
  loading?: "eager" | "lazy";
};

export function Logo({
  className,
  alt = "Taller Yeyu",
  loading = "eager",
}: LogoProps) {
  return (
    <img
      src="/brand/logo-sm.webp"
      alt={alt}
      width={240}
      height={226}
      className={className}
      loading={loading}
      fetchPriority="low"
      decoding="async"
    />
  );
}
