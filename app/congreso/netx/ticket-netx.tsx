"use client";

import Link from "next/link";
import { useState } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import { hrefSumarte } from "@/components/sesion/entrar-para";
import { useSesion } from "@/components/sesion/contexto";
import type { Idioma } from "@/lib/congreso/idioma";
import { queMostrarEnTicket } from "@/lib/congreso/mostrar-ticket";
import { RegistroTicket } from "../registro-ticket";
import { textosNetx } from "./textos";

const CLASE_LEGAL = "ev-legal";

/**
 * "Tu ticket también abre la puerta a NetX": los cinco pasos, el registro del ticket y el sello Genesis.
 * El registro solo se monta con sesión, nivel Explorador y política vigente (queMostrarEnTicket); si no, hay un llamado
 * a sumarse. Sin sesión no se lee ni se escribe nada del ticket en el navegador. El idioma solo cambia los textos:
 * la decisión de qué mostrar es la misma en los dos.
 */
export function TicketNetx({ idioma = "es" }: { idioma?: Idioma }) {
  const { estado, nivel, nivelListo, consentimiento } = useSesion();
  const [ticket, setTicket] = useState<string | null>(null);
  const que = queMostrarEnTicket(estado, nivel, nivelListo, consentimiento);
  const TEXTO_TICKET = textosNetx(idioma).ticket;
  const { llamado, genesis } = TEXTO_TICKET;
  const volver = idioma === "en" ? "/congreso/en#ticket" : "/congreso#ticket";
  return (
    <section className="ev-seccion ev-ticket-seccion" id="ticket" aria-labelledby="t-ticket">
      <div className="ev-cont">
        <h2 id="t-ticket">{TEXTO_TICKET.titulo}</h2>
        <p className="ev-bajada">{TEXTO_TICKET.bajada}</p>
        <ol className="ev-puente">
          {TEXTO_TICKET.pasos.map((p) => (
            <li key={p.id} className={`ev-paso${p.quien === "NetX" ? " ev-paso-netx" : ""}`}>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
              <div className="ev-quien">
                <span className="ev-solo-lectores">{TEXTO_TICKET.loHace}</span>
                {p.quien}
              </div>
            </li>
          ))}
        </ol>
        <div className="ev-vincular">
          <div>
            {que === "formulario" ? (
              <RegistroTicket apariencia="evento" alCambiar={setTicket} idioma={idioma} />
            ) : que === "sumate" || que === "politica" ? (
              <div className="ev-caja">
                <h3>{llamado.titulo}</h3>
                <p>{llamado.texto}</p>
                <Link
                  className="ev-boton ev-boton-corona"
                  href={hrefSumarte(volver, "explorador")}
                  hrefLang={idioma === "en" ? "es" : undefined}
                >
                  {que === "sumate" ? llamado.sumate : llamado.politica}
                </Link>
              </div>
            ) : null}
          </div>
          <div className="ev-caja ev-genesis">
            <div className="ev-sello" aria-hidden="true">
              <span>{genesis.sello}</span>
            </div>
            <div>
              <h3>{genesis.titulo}</h3>
              {que === "formulario" && ticket ? (
                <p className="ev-genesis-estado">{genesis.conTicket}</p>
              ) : (
                <p>{genesis.sinTicket}</p>
              )}
              <p>
                {genesis.presencia}
                <TerminoLegal clave="presencia" claseBoton={CLASE_LEGAL} idioma={idioma} />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
