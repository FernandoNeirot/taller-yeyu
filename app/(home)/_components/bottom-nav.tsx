"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "./material-icon";
import { isNavActive, navItems } from "./nav";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-4 pt-2 bg-surface-container-lowest/90 dark:bg-surface-container-lowest/90 backdrop-blur-lg rounded-t-xl z-50 border-t border-outline-variant/20 transition-transform duration-300"
      id="bottom-nav"
    >
      {navItems.map((item) => {
        const active = isNavActive(item.href, pathname);

        return (
          <Link
            key={item.label}
            className={
              active
                ? "flex flex-col items-center justify-center text-primary dark:text-primary border-t-2 border-primary pt-2 w-1/4 active:scale-90 transition-transform duration-200"
                : "flex flex-col items-center justify-center text-on-surface-variant dark:text-on-surface-variant pt-2 w-1/4 hover:bg-surface-container-high/50 transition-all active:scale-90 duration-200 border-t-2 border-transparent"
            }
            href={item.href}
          >
            <MaterialIcon name={item.icon} filled={active} className="mb-1" />
            <span className="font-label-caps text-[10px] tracking-wider">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
