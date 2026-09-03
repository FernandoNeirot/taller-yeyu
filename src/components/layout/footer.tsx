import { Logo } from "./logo";

const socialLinks = ["Instagram", "Facebook", "WhatsApp"];

export function Footer() {
  return (
    <footer className="w-full py-xl px-container-margin bg-surface-container-lowest dark:bg-surface-container-lowest border-t border-outline-variant pb-32 md:pb-xl">
      <div className="flex flex-col md:flex-row justify-between items-center gap-md max-w-7xl mx-auto">
        <div className="h-14">
          <Logo className="h-full w-auto object-contain" />
        </div>
        <div className="flex gap-lg">
          {socialLinks.map((label) => (
            <a
              key={label}
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors hover:opacity-80"
              href="#"
            >
              {label}
            </a>
          ))}
        </div>
        <div className="font-body-md text-body-md text-on-surface-variant text-sm text-center md:text-right">
          © 2024 Taller Yeyu. Carpintería de Corazón.
        </div>
      </div>
    </footer>
  );
}
