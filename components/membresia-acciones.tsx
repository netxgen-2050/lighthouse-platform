"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { EntrarPara } from "@/components/sesion/entrar-para";
import { useSesion } from "@/components/sesion/contexto";
import { puedeCapacidad } from "@/lib/permisos/niveles";
import { TerminoLegal } from "@/components/termino-legal";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { COMUNIDAD_LIGHTHOUSE } from "@/lib/membresia/estado";
import { useMembresia } from "@/lib/membresia/usar-membresia";

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const DORADO = `${BOTON} bg-gold text-ink hover:bg-gold-soft`;
const SUAVE = `${BOTON} border border-muted hover:bg-surface-2`;

type Props = {
  /** `lighthouse` o el id de la tribu. */
  comunidad: string;
  nombre: string;
  /** Si Pactos está disponible en la navegación. */
  pactos: boolean;
  /** Acciones propias del lugar donde se muestra (por ejemplo, el enlace al mapa). */
  extra?: ReactNode;
};

/**
 * Botones según la membresía simulada de la persona en la comunidad:
 * no miembro (leer / adherir), pedido enviado (esperando) o miembro (proponer pacto / sala).
 */
export function MembresiaAcciones({ comunidad, nombre, pactos, extra }: Props) {
  const { estado: estadoSesion, nivel, nivelListo } = useSesion();
  const conSesion = estadoSesion === "ok";
  // Adherir es de Miembro en adelante; Explorador y sin cuenta ven "Sumate para adherir".
  const puedeAdherir = conSesion && puedeCapacidad(nivel, "adherir");
  const { estado, cargado, falloAlmacen, aceptar, desactualizada } = useMembresia(comunidad, conSesion);
  const idioma = useIdioma();
  const t = useTextos("tribus").membresia;
  const [mensaje, setMensaje] = useState("");
  const aviso = useRef<HTMLParagraphElement>(null);
  const moverFoco = useRef(false);
  const esLighthouse = comunidad === COMUNIDAD_LIGHTHOUSE;
  const manifiesto = `/tribus/${comunidad}/manifiesto`;

  // Si el botón que tenía el foco desaparece (por ejemplo al aceptar), el foco pasa a la zona de avisos.
  useEffect(() => {
    if (moverFoco.current) {
      moverFoco.current = false;
      aviso.current?.focus();
    }
  }, [estado]);

  // Sin ser Miembro se puede leer el manifiesto, pero adherir pide sumarse. Mientras se verifica la sesión no se muestra ningún botón.
  if (!puedeAdherir && estadoSesion !== "cargando" && !(conSesion && !nivelListo)) {
    return (
      <div className="grid gap-2">
        <div className="flex flex-wrap gap-3">
          <Link className={SUAVE} href={manifiesto}>
            {t.leerManifiesto(esLighthouse)}
          </Link>
          <EntrarPara texto={t.sumateAdherir} clase={DORADO} nivelMinimo="miembro" />
          {extra}
        </div>
        <p className="text-sm text-muted">{t.puedesLeer}</p>
      </div>
    );
  }

  // Hasta leer lo guardado no se muestra ningún botón, para no mostrar "Adherir" a quien ya es miembro.
  if (!cargado) return <div className="min-h-10" aria-hidden="true" />;

  const textoPedido = t.pedidoLlego(esLighthouse, nombre);

  return (
    <div className="grid gap-2">
      {/* Zona de avisos siempre presente: así los lectores de pantalla leen lo que se escribe en ella. */}
      <p ref={aviso} tabIndex={-1} role="status" className="text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
        {mensaje}
      </p>
      {estado === "pedido" && !desactualizada && !mensaje && <p className="text-sm font-medium">{textoPedido}</p>}
      <div className="flex flex-wrap gap-3">
        {estado === "miembro" && !desactualizada ? (
          <>
            {pactos && (
              <Link className={PRIMARIO} href={`/pactos?comunidad=${comunidad}`}>
                {t.proponerPacto}
              </Link>
            )}
            <button
              type="button"
              className={SUAVE}
              onClick={() => setMensaje(esLighthouse ? t.salaLighthouse : t.salaTribu)}
            >
              {t.entrarSala}
            </button>
          </>
        ) : (
          <>
            <Link className={SUAVE} href={manifiesto}>
              {t.leerManifiesto(esLighthouse)}
            </Link>
            {estado === "no-miembro" || desactualizada ? (
              <span className="inline-flex items-center">
                <Link className={DORADO} href={manifiesto}>
                  {t.adherirManifiesto(esLighthouse)}
                </Link>
                <TerminoLegal clave="adhesion" idioma={idioma} />
              </span>
            ) : (
              <button
                type="button"
                className={PRIMARIO}
                onClick={() => {
                  moverFoco.current = true;
                  setMensaje(t.yaSosParte(esLighthouse, nombre));
                  aceptar();
                }}
              >
                {t.simularAcepta}
              </button>
            )}
          </>
        )}
        {extra}
      </div>
      {(estado === "no-miembro" || desactualizada) && <p className="text-sm text-muted">{t.antesDeAdherir}</p>}
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium">
          {t.falloAlmacen}
        </p>
      )}
    </div>
  );
}
