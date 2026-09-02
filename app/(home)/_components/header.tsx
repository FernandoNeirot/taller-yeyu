"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Logo } from "./logo";
import { isNavActive, navItems } from "./nav";

export function Header() {
  const pathname = usePathname();
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
      className="fixed top-0 w-full z-50 bg-background/80 dark:bg-background/80 backdrop-blur-md border-b border-outline-variant/30 transition-all duration-300"
      id="top-app-bar"
    >
      <div className="flex justify-center md:justify-between items-center px-container-margin py-md w-full max-w-7xl mx-auto">
        <Link className="flex items-center h-14" href="/">
          <Logo className="h-full w-auto object-contain" priority />
        </Link>
        <nav className="hidden md:flex gap-lg items-center">
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
        </nav>
      </div>
    </header>
  );
}
