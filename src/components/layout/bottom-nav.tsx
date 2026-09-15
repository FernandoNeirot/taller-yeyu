"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartButton } from "@/components/cart/cart-button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { isNavActive, navItems } from "./nav";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 flex items-center justify-around rounded-t-xl border-t border-outline-variant/20 bg-surface-container-lowest/90 px-2 pb-4 pt-2 backdrop-blur-lg md:hidden"
      id="bottom-nav"
      style={{ width: "100%", zIndex: 50 }}
    >
      {navItems.map((item) => {
        const active = isNavActive(item.href, pathname);

        return (
          <Link
            key={item.label}
            className={
              active
                ? "flex flex-col items-center justify-center border-t-2 border-primary pt-2 text-primary active:scale-90"
                : "flex flex-col items-center justify-center border-t-2 border-transparent pt-2 text-on-surface-variant hover:bg-surface-container-high/50 active:scale-90"
            }
            href={item.href}
            style={{ width: "20%" }}
          >
            <MaterialIcon name={item.icon} filled={active} className="mb-1" />
            <span className="font-label-caps text-[10px] tracking-wider">
              {item.label}
            </span>
          </Link>
        );
      })}
      <CartButton variant="nav" />
    </nav>
  );
}
