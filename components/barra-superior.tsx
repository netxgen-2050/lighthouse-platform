import { destinosDeGrupo } from "@/lib/navegacion";
import { Campanita } from "./campanita";
import { MenuPersona } from "./menu-persona";
import { EnlaceNetx } from "./sesion/enlace-netx";
import { SoloConSesion } from "./sesion/puerta";

/**
 * Barra superior fija, arriba a la derecha: NetX (interno, solo super admin), la campanita y el menú de la persona (o "Sumarte" y "Entrar" sin sesión).
 * Server component: toma los destinos que existen y pasa íconos ya renderizados al cliente.
 */
export function BarraSuperior() {
  const interno = destinosDeGrupo("interno");
  const persona = destinosDeGrupo("persona").map((d) => ({
    href: d.href,
    etiqueta: d.etiqueta,
    icono: <d.icono aria-hidden="true" size={16} />,
  }));
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-end gap-1 border-b border-line bg-surface px-2 text-ink sm:gap-2 sm:px-4">
      {interno.map((d) => (
        <EnlaceNetx key={d.href} href={d.href} etiqueta={d.etiqueta} icono={<d.icono aria-hidden="true" size={18} />} />
      ))}
      <SoloConSesion>
        <Campanita />
      </SoloConSesion>
      <MenuPersona items={persona} />
    </header>
  );
}
