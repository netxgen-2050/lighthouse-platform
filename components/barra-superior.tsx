import { destinosDeGrupo, etiquetaDeDestino } from "@/lib/navegacion";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { Campanita } from "./campanita";
import { MenuCelular } from "./menu-celular";
import { MenuPersona } from "./menu-persona";
import { SelectorIdioma } from "./selector-idioma";
import { EnlaceNetx } from "./sesion/enlace-netx";
import { SoloConConsentimiento } from "./sesion/puerta";

/**
 * Barra superior fija, arriba a la derecha: NetX (interno, toda persona con sesión), la campanita, el selector de idioma
 * (con y sin sesión) y el menú de la persona (o "Sumarte" y "Entrar" sin sesión).
 * Server component: toma los destinos que existen y pasa íconos ya renderizados al cliente.
 */
export async function BarraSuperior() {
  const idioma = await idiomaDelPedido();
  // Solo NetX va arriba; Admin (también "interno") va en el rail y solo lo ve el super admin.
  const interno = destinosDeGrupo("interno").filter((d) => d.clave === "netx");
  const persona = destinosDeGrupo("persona").map((d) => ({
    href: d.href,
    etiqueta: etiquetaDeDestino(d, idioma),
    icono: <d.icono aria-hidden="true" size={16} />,
  }));
  const t = textos("marco", idioma);
  const principales = destinosDeGrupo("principal").map((d) => ({
    href: d.href,
    etiqueta: etiquetaDeDestino(d, idioma),
    icono: <d.icono aria-hidden="true" size={20} />,
    secciones: d.secciones,
  }));
  const adminDestino = destinosDeGrupo("interno").find((d) => d.clave === "admin");
  const admin = adminDestino && {
    href: adminDestino.href,
    etiqueta: etiquetaDeDestino(adminDestino, idioma),
    icono: <adminDestino.icono aria-hidden="true" size={20} />,
  };
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-end gap-1 border-b border-line bg-surface px-2 text-ink sm:gap-2 sm:px-4">
      <MenuCelular items={principales} admin={admin} etiquetaMenu={t.barra.menu} etiquetaNavegacion={t.rail.navegacion} />
      {interno.map((d) => (
        <EnlaceNetx
          key={d.href}
          href={d.href}
          etiqueta={etiquetaDeDestino(d, idioma)}
          icono={<d.icono aria-hidden="true" size={18} />}
        />
      ))}
      <SoloConConsentimiento>
        <Campanita />
      </SoloConConsentimiento>
      <SelectorIdioma />
      <MenuPersona items={persona} />
    </header>
  );
}
