export const navItems = [
  { href: "/", label: "INICIO", icon: "home" },
  { href: "/galeria", label: "GALERÍA", icon: "grid_view" },
  { href: "/#proceso", label: "PROCESO", icon: "architecture" },
  { href: "/#contacto", label: "CONTACTO", icon: "mail" },
] as const;

export function isNavActive(href: string, pathname: string) {
  if (href === "/galeria") {
    return pathname === "/galeria";
  }

  return href === "/" && pathname === "/";
}
