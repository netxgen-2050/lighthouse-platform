import { destinosDisponibles } from "@/lib/navegacion";
import { RailEnlaces } from "./rail-enlaces";

// Server component: toma los destinos que existen y pasa íconos ya renderizados al cliente.
export function Rail() {
  const items = destinosDisponibles().map((d) => ({
    href: d.href,
    etiqueta: d.etiqueta,
    icono: <d.icono aria-hidden="true" size={20} />,
  }));
  return (
    <div className="sticky top-0 flex h-dvh w-16 shrink-0 flex-col overflow-y-auto overscroll-contain bg-deep py-3 text-on-deep sm:w-20">
      <p className="mb-3 text-center font-display text-lg font-bold">NetX</p>
      <nav aria-label="Principal">
        <RailEnlaces items={items} />
      </nav>
    </div>
  );
}
