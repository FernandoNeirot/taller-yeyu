import type { Metadata } from "next";
import { Simulacro } from "@/features/entrevista/components/simulacro";

export const metadata: Metadata = {
  title: "Simulacro de entrevista",
  robots: { index: false, follow: false },
};

export default function EntrevistaPage() {
  return <Simulacro />;
}
