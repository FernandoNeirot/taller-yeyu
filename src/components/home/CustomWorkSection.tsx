import { MaterialIcon } from "@/components/ui/material-icon";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { customWorkWhatsAppMessage } from "@/lib/whatsapp";

export function CustomWorkSection() {
  return (
    <section
      className="w-full px-container-margin py-xl mb-xl"
      id="contacto"
    >
      <div
        className="mx-auto flex flex-col items-center space-y-md border border-outline-variant/30 bg-surface-container-high p-lg text-center md:p-xl"
        style={{ width: "100%", maxWidth: "56rem" }}
      >
        <MaterialIcon
          name="architecture"
          className="text-4xl text-primary mb-xs"
        />
        <h2 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-on-surface">
          Contanos tu ocasión
        </h2>
        <p
          className="font-body-md text-body-md text-on-surface-variant"
          style={{ width: "100%" }}
        >
          Baby shower, cumpleaños o un regalo especial: decinos la temática y te
          armamos sugerencias a medida.
        </p>
        <WhatsAppButton
          message={customWorkWhatsAppMessage()}
          variant="primary"
          className="mt-md sm:w-auto"
          fullWidth
        >
          Cotizar Trabajo a Medida
        </WhatsAppButton>
      </div>
    </section>
  );
}
