"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bug, Ellipsis } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTextos } from "@/lib/idioma/cliente";
import { puedeCapacidad } from "@/lib/permisos/niveles";
import { itemActivo } from "@/lib/ruta-activa";
import { abrirReporte } from "./boton-reportar";
import type { ItemMenu } from "./menu-persona";
import type { ItemRail } from "./rail-enlaces";
import { SelectorIdioma } from "./selector-idioma";
import { useSesion } from "./sesion/contexto";
import { Hoja } from "./ui/hoja";

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const FILA = `flex min-h-11 items-center gap-3 rounded-[var(--radius-s)] px-3 py-2 hover:bg-surface-2 ${FOCO}`;

export type PropsBarraInferior = {
  /** Los cinco de la barra, en orden. */
  barra: ItemRail[];
  /** Destinos del menú que no están en la barra (Bien común, Sumarte). */
  mas: ItemRail[];
  /** Destinos de la persona (Perfil, Pasaporte...). */
  persona: ItemMenu[];
  /** NetX, para toda persona con sesión (en el celular no cabe en la barra superior). */
  netx?: ItemRail;
  admin?: ItemRail;
  etiquetaNavegacion: string;
};

/**
 * Barra inferior del celular (menos de 768 px, ux-celular design §1): los cinco destinos con ícono y etiqueta y "Más",
 * que abre la hoja con el resto. Cada ítem mide al menos 48 px de alto; el actual lleva color, negrita y `aria-current`.
 */
export function BarraInferiorCliente({ barra, mas, persona, netx, admin, etiquetaNavegacion }: PropsBarraInferior) {
  const t = useTextos("marco");
  const ruta = usePathname();
  const [abierta, setAbierta] = useState(false);
  const disparador = useRef<HTMLButtonElement>(null);
  const { estado, sesion } = useSesion();
  const verAdmin = admin && estado === "ok" && sesion?.rol === "superadmin";

  // Cambiar de página cierra la hoja.
  useEffect(() => setAbierta(false), [ruta]);

  const marcado = itemActivo(barra, ruta);
  // "Más" se marca cuando la página actual es uno de sus destinos.
  const enMas = !marcado && itemActivo([...mas, ...persona.map((p) => ({ href: p.href })), ...(verAdmin ? [admin] : [])], ruta) !== undefined;

  return (
    <>
      <nav
        aria-label={etiquetaNavegacion}
        className="fixed inset-x-0 bottom-0 z-40 bg-surface pb-[env(safe-area-inset-bottom,0px)] text-ink md:hidden"
      >
        {/* h-14 (56 px, con el borde) es el valor de --alto-barra-inferior: el espacio que reservan Hifa y el pie. */}
        <ul className="flex h-14 border-t border-line">
          {barra.map((e) => {
            const activo = marcado === e;
            return (
              <li key={e.href} className="flex min-w-0 flex-1">
                <Link href={e.href} aria-current={activo ? "page" : undefined} className={claseItem(activo)}>
                  {e.icono}
                  <span className={claseEtiqueta(activo)}>{e.etiqueta}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex min-w-0 flex-1">
            <button
              ref={disparador}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={abierta}
              onClick={() => setAbierta(true)}
              className={`w-full ${claseItem(enMas)}`}
            >
              <Ellipsis aria-hidden="true" size={22} />
              <span className={claseEtiqueta(enMas)}>{t.barra.mas}</span>
            </button>
          </li>
        </ul>
      </nav>
      <Hoja abierta={abierta} alCerrar={() => setAbierta(false)} titulo={t.barra.mas} etiquetaCerrar={t.barra.cerrar} devolverFoco={disparador}>
        <ContenidoMas
          mas={mas}
          persona={persona}
          netx={netx}
          admin={verAdmin ? admin : undefined}
          cerrar={() => setAbierta(false)}
        />
      </Hoja>
    </>
  );
}

function claseItem(activo: boolean) {
  return `flex min-h-12 w-full flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 ${activo ? "text-deep" : "text-muted"} ${FOCO}`;
}

function claseEtiqueta(activo: boolean) {
  return `max-w-full truncate text-[0.6875rem] leading-tight ${activo ? "font-bold" : "font-medium"}`;
}

function EnlaceFila({ item, cerrar, ruta }: { item: { href: string; etiqueta: string; icono: ReactNode }; cerrar: () => void; ruta: string }) {
  const activo = itemActivo([item], ruta) !== undefined;
  return (
    <li>
      <Link href={item.href} aria-current={activo ? "page" : undefined} onClick={cerrar} className={`${FILA} ${activo ? "bg-surface-2 font-bold" : ""}`}>
        {item.icono}
        <span>{item.etiqueta}</span>
      </Link>
    </li>
  );
}

/** Lo de la hoja Más, en este orden: Entrar (sin sesión), destinos, destinos de la persona, idioma, Reportar y Admin. */
function ContenidoMas({
  mas,
  persona,
  netx,
  admin,
  cerrar,
}: {
  mas: ItemRail[];
  persona: ItemMenu[];
  netx?: ItemRail;
  admin?: ItemRail;
  cerrar: () => void;
}) {
  const t = useTextos("marco");
  const ruta = usePathname();
  const { estado, entrar, consentimiento, nivel } = useSesion();
  const conSesion = estado === "ok";
  const sinSesion = estado === "sin-sesion" || estado === "error";
  const vigente = conSesion && consentimiento === "vigente";
  const verNetx = netx && conSesion && puedeCapacidad(nivel, "vista-netx");
  return (
    <div className="flex flex-col gap-3">
      {sinSesion && (
        <button
          type="button"
          className={`${FILA} border border-line font-medium`}
          onClick={() => {
            cerrar();
            entrar();
          }}
        >
          {t.barra.entrar}
        </button>
      )}
      <ul className="flex flex-col">
        {mas.map((e) => (
          <EnlaceFila key={e.href} item={e} cerrar={cerrar} ruta={ruta} />
        ))}
      </ul>
      {(vigente || verNetx) && (
        <ul className="flex flex-col border-t border-line pt-2">
          {vigente && persona.map((e) => <EnlaceFila key={e.href} item={e} cerrar={cerrar} ruta={ruta} />)}
          {verNetx && <EnlaceFila item={netx} cerrar={cerrar} ruta={ruta} />}
        </ul>
      )}
      <div className="border-t border-line pt-2">
        <h3 className="px-3 pb-1 text-sm font-medium text-muted">{t.barra.idioma}</h3>
        <SelectorIdioma variante="lista" />
      </div>
      <div className="border-t border-line pt-2">
        <button
          type="button"
          lang="es"
          className={`${FILA} w-full text-left`}
          onClick={() => {
            cerrar();
            // Tras cerrar la hoja el foco vuelve a "Más" y de ahí lo toma el formulario para devolverlo al cerrar.
            window.setTimeout(abrirReporte, 0);
          }}
        >
          <Bug aria-hidden="true" size={20} />
          <span>Reportar un error</span>
        </button>
      </div>
      {admin && (
        <ul className="flex flex-col border-t border-line pt-2">
          <EnlaceFila item={admin} cerrar={cerrar} ruta={ruta} />
        </ul>
      )}
    </div>
  );
}
