import { LaserLoader } from "@/components/ui/laser-loader";

export default function HomeLoading() {
  return (
    <main className="w-full px-container-margin">
      <LaserLoader fullScreen label="Cargando…" />
    </main>
  );
}
