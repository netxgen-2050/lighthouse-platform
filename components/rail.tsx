import { destinosDeGrupo, etiquetaDeDestino, tituloGrupoInterno } from "@/lib/navegacion";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { RailAdmin } from "./rail-admin";
import { RailEnlaces } from "./rail-enlaces";

// Server component: toma los destinos principales que existen y pasa íconos ya renderizados al cliente.
// El rail es solo navegación (angosto, desde 768 px); NetX, la campanita y el avatar viven en la barra superior,
// y en el celular los mismos destinos están en el botón "Menú" (components/menu-celular.tsx).
export async function Rail() {
  const idioma = await idiomaDelPedido();
  const t = textos("marco", idioma);
  const items = destinosDeGrupo("principal").map((d) => ({
    href: d.href,
    etiqueta: etiquetaDeDestino(d, idioma),
    icono: <d.icono aria-hidden="true" size={20} />,
    secciones: d.secciones,
  }));
  const admin = destinosDeGrupo("interno").find((d) => d.clave === "admin");
  return (
    <div className="sticky top-0 hidden h-dvh w-20 shrink-0 flex-col overflow-y-auto overscroll-contain bg-deep py-3 text-on-deep md:flex">
      <nav aria-label={t.rail.navegacion}>
        <RailEnlaces items={items} />
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
