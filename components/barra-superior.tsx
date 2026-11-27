import Link from "next/link";
import { destinosDeGrupo, etiquetaDeDestino } from "@/lib/navegacion";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { Campanita } from "./campanita";
import { DisparadorReportar } from "./disparador-reportar";
import { MenuPersona } from "./menu-persona";
import { EnlaceNetx } from "./sesion/enlace-netx";
import { SoloConConsentimiento } from "./sesion/puerta";

/**
 * Barra superior fija. Compu: arriba a la derecha NetX (interno, toda persona con sesión), "Reportar", la campanita y el
 * menú de la persona (o "Sumarte" y "Entrar" sin sesión). Celular: la marca "Lighthouse" a la izquierda y "Sumarte" o el
 * avatar a la derecha; los destinos están en la barra inferior y NetX, Reportar y el idioma en la hoja Más.
 * El idioma ya no es un control fijo: vive en el menú del avatar, en "⋯" sin sesión, en Más y en Configuración.
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
      <Link
        href="/"
        className="mr-auto flex min-h-11 items-center rounded-[var(--radius-s)] px-1 font-display text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep md:hidden"
      >
        Lighthouse
      </Link>
      <div className="hidden md:block">
        {interno.map((d) => (
          <EnlaceNetx
            key={d.href}
            href={d.href}
            etiqueta={etiquetaDeDestino(d, idioma)}
            icono={<d.icono aria-hidden="true" size={18} />}
          />
        ))}
      </div>
      <DisparadorReportar />
      <SoloConConsentimiento>
        <Campanita />
      </SoloConConsentimiento>
      <MenuPersona items={persona} />
    </header>
  );
}
