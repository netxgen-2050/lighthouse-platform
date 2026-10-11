import Link from "next/link";
import { destinosDeGrupo } from "@/lib/navegacion";
import { Campanita } from "./campanita";
import { MenuPersona } from "./menu-persona";

/**
 * Barra superior fija, arriba a la derecha: NetX (interno), la campanita y el menú de la persona.
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
        <Link
          key={d.href}
          href={d.href}
          className="flex h-9 items-center gap-1.5 rounded-full px-2 text-sm font-medium hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
        >
          <d.icono aria-hidden="true" size={18} />
          {d.etiqueta}
          <span className="rounded-full border border-muted px-1.5 text-[0.6875rem] leading-tight text-muted">Interno</span>
        </Link>
      ))}
      <Campanita />
      <MenuPersona items={persona} />
    </header>
  );
}
