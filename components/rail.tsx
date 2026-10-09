import { destinosDeGrupo, GRUPOS_RAIL, type Destino } from "@/lib/navegacion";
import { Campanita } from "./campanita";
import { MenuPersona } from "./menu-persona";
import { RailEnlaces, type GrupoRail } from "./rail-enlaces";

// Server component: toma los destinos que existen y pasa íconos ya renderizados al cliente.
function item(d: Destino, extra: { destacado?: boolean; marca?: string } = {}) {
  return { href: d.href, etiqueta: d.etiqueta, icono: <d.icono aria-hidden="true" size={20} />, ...extra };
}

export function Rail() {
  const grupos: GrupoRail[] = GRUPOS_RAIL.map((g) => ({
    id: g.id,
    titulo: g.titulo,
    tituloVisible: g.id !== "sumarte",
    items: destinosDeGrupo(g.id).map((d) => item(d, { destacado: g.id === "sumarte" })),
  })).filter((g) => g.items.length > 0);
  const interno = destinosDeGrupo("interno");
  if (interno.length > 0) {
    grupos.push({ id: "interno", titulo: "Interno", tituloVisible: false, items: interno.map((d) => item(d, { marca: "Interno" })) });
  }
  const persona = destinosDeGrupo("persona").map((d) => ({
    href: d.href,
    etiqueta: d.etiqueta,
    icono: <d.icono aria-hidden="true" size={16} />,
  }));
  return (
    <div className="sticky top-0 flex h-dvh w-16 shrink-0 flex-col overflow-y-auto overscroll-contain bg-deep py-3 text-on-deep sm:w-20">
      <p className="mb-3 text-center font-display text-lg font-bold">NetX</p>
      <nav aria-label="Principal">
        <RailEnlaces grupos={grupos} />
      </nav>
      <div className="mt-auto flex flex-col pt-3">
        <Campanita />
        <MenuPersona items={persona} />
      </div>
    </div>
  );
}
