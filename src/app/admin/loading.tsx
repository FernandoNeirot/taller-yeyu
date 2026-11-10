import { LaserLoader } from "@/components/ui/laser-loader";

export default function AdminLoading() {
  return (
    <main className="w-full px-container-margin">
      <LaserLoader fullScreen label="Cargando…" />
    </main>
  );
}
