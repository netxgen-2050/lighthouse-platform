import { destinosDeGrupo, etiquetaDeDestino, GRUPOS_RAIL, tituloDeGrupo, tituloGrupoInterno, type Destino } from "@/lib/navegacion";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import type { Idioma } from "@/lib/idioma/tipos";
import { textos } from "@/lib/idioma/textos";
import { RailAdmin } from "./rail-admin";
import { RailEnlaces, type GrupoRail } from "./rail-enlaces";

// Server component: toma los destinos que existen y pasa íconos ya renderizados al cliente.
// El rail es solo navegación; NetX, la campanita y el avatar viven en la barra superior.
function item(d: Destino, idioma: Idioma, extra: { destacado?: boolean } = {}) {
  return {
    href: d.href,
    etiqueta: etiquetaDeDestino(d, idioma),
    icono: <d.icono aria-hidden="true" size={20} />,
    // "Semillas" no se traduce: que el traductor del navegador tampoco la cambie.
    sinTraducir: d.clave === "semillas",
    ...extra,
  };
}

export async function Rail() {
  const idioma = await idiomaDelPedido();
  const t = textos("marco", idioma);
  const grupos: GrupoRail[] = GRUPOS_RAIL.map((g) => ({
    id: g.id,
    titulo: tituloDeGrupo(g.id, idioma),
    tituloVisible: g.id !== "sumarte",
    items: destinosDeGrupo(g.id).map((d) => item(d, idioma, { destacado: g.id === "sumarte" })),
  })).filter((g) => g.items.length > 0);
  const admin = destinosDeGrupo("interno").find((d) => d.clave === "admin");
  return (
    <div className="sticky top-0 flex h-dvh w-16 shrink-0 flex-col overflow-y-auto overscroll-contain bg-deep py-3 text-on-deep sm:w-20">
      <nav aria-label={t.rail.navegacion}>
        <RailEnlaces grupos={grupos} />
        {admin && (
          <RailAdmin
            href={admin.href}
            etiqueta={etiquetaDeDestino(admin, idioma)}
            titulo={tituloGrupoInterno(idioma)}
            icono={<admin.icono aria-hidden="true" size={20} />}
          />
        )}
      </nav>
    </div>
  );
}
