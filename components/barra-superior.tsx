import { destinosDeGrupo, etiquetaDeDestino } from "@/lib/navegacion";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { Campanita } from "./campanita";
import { MenuPersona } from "./menu-persona";
import { SelectorIdioma } from "./selector-idioma";
import { EnlaceNetx } from "./sesion/enlace-netx";
import { SoloConSesion } from "./sesion/puerta";

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
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-end gap-1 border-b border-line bg-surface px-2 text-ink sm:gap-2 sm:px-4">
      {interno.map((d) => (
        <EnlaceNetx
          key={d.href}
          href={d.href}
          etiqueta={etiquetaDeDestino(d, idioma)}
          icono={<d.icono aria-hidden="true" size={18} />}
        />
      ))}
      <SoloConSesion>
        <Campanita />
      </SoloConSesion>
      <SelectorIdioma />
      <MenuPersona items={persona} />
    </header>
  );
}
