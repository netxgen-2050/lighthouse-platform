import { destinosDeGrupo, GRUPOS_RAIL, type Destino } from "@/lib/navegacion";
import { RailEnlaces, type GrupoRail } from "./rail-enlaces";

// Server component: toma los destinos que existen y pasa íconos ya renderizados al cliente.
// El rail es solo navegación; NetX, la campanita y el avatar viven en la barra superior.
function item(d: Destino, extra: { destacado?: boolean } = {}) {
  return {
    href: d.href,
    etiqueta: d.etiqueta,
    icono: <d.icono aria-hidden="true" size={20} />,
    ...extra,
  };
}

export function Rail() {
  const grupos: GrupoRail[] = GRUPOS_RAIL.map((g) => ({
    id: g.id,
    titulo: g.titulo,
    tituloVisible: g.id !== "sumarte",
    items: destinosDeGrupo(g.id).map((d) => item(d, { destacado: g.id === "sumarte" })),
  })).filter((g) => g.items.length > 0);
  return (
    <div className="sticky top-0 flex h-dvh w-16 shrink-0 flex-col overflow-y-auto overscroll-contain bg-deep py-3 text-on-deep sm:w-20">
      <nav aria-label="Principal">
        <RailEnlaces grupos={grupos} />
      </nav>
    </div>
  );
}
