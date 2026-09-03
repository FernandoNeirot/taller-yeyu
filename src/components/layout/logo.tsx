import Image from "next/image";

type LogoProps = {
  className?: string;
  priority?: boolean;
};

export function Logo({ className, priority = false }: LogoProps) {
  return (
    <Image
      src="/brand/logo-dark.png"
      alt="Taller Yeyu"
      width={956}
      height={901}
      className={className}
      style={{ width: "auto" }}
      priority={priority}
    />
  );
}
