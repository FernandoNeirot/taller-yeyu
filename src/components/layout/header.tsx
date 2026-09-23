"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAdminAccessHint } from "@/features/admin/lib/admin-access-hint";
import { Logo } from "./logo";
import { isNavActive, navItems } from "./nav";
import { CartButton } from "@/components/cart/cart-button";

export function Header() {
  const pathname = usePathname();
  const showAdmin = useAdminAccessHint();
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const onScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > lastScrollTop.current && scrollTop > 100) {
        header.style.transform = "translateY(-100%)";
      } else {
        header.style.transform = "translateY(0)";
      }
      lastScrollTop.current = scrollTop <= 0 ? 0 : scrollTop;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 w-full border-b border-outline-variant/30 bg-background transition-all duration-300 md:bg-background/80 md:backdrop-blur-md"
      style={{ zIndex: 60 }}
      id="top-app-bar"
    >
      <div className="relative flex justify-center md:justify-between items-center px-container-margin py-md w-full max-w-7xl mx-auto">
        <Link
          className="flex items-center h-14"
          href="/"
          aria-label="Taller Yeyu, ir al inicio"
        >
          <Logo alt="" className="h-full w-auto object-contain" />
        </Link>
        <nav aria-label="Principal" className="hidden md:flex gap-lg items-center">
          {navItems.map((link) => {
            const active = isNavActive(link.href, pathname);

            return (
              <Link
                key={link.label}
                className={
                  active
                    ? "font-label-caps text-label-caps text-primary dark:text-primary font-bold hover:text-primary transition-colors duration-300"
                    : "font-label-caps text-label-caps text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors duration-300"
                }
                href={link.href}
              >
                {link.label}
              </Link>
            );
          })}
          {showAdmin ? (
            <Link
              href="/admin/login"
              className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors duration-300"
            >
              ADMIN
            </Link>
          ) : null}
          <CartButton />
        </nav>
        {showAdmin ? (
          <Link
            href="/admin/login"
            className="absolute left-4 font-label-caps text-label-caps text-on-surface-variant hover:text-primary md:hidden"
          >
            ADMIN
          </Link>
        ) : null}
        <div className="absolute right-4 md:hidden">
          <CartButton />
        </div>
      </div>
    </header>
  );
}
