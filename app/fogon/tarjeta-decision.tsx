"use client";

import Link from "next/link";
import { AvisoAdhesion } from "@/components/fogon/aviso-adhesion";
import { TerminoLegal } from "@/components/termino-legal";
import { TextoBilingue } from "@/components/texto-bilingue";
import { opciones as opcionesDe, type Decision } from "@/lib/fogon/datos";
import { contar, motivoSinVoto, puedeLlevarAlConsejo, votoPropio } from "@/lib/fogon/estado";
import { propuestaDe } from "@/lib/fogon/propuestas/ejemplos";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { textoEn } from "@/lib/idioma/tipos";
import { ParametrosDecision } from "./parametros-decision";
import type { FogonUsado } from "./usar-fogon";

const BOTON =
  "rounded-lg border px-4 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON_SUAVE = `${BOTON} border-muted hover:bg-surface-2`;
const CHIP = "rounded-full border border-faint px-3 py-0.5 text-sm";

/** El texto con el nombre de la tribu (si lo trae) marcado `translate="no"`: los nombres propios no se traducen. */
export function ConTribu({ texto, tribu }: { texto: string; tribu?: string }) {
  const i = tribu ? texto.indexOf(tribu) : -1;
  if (!tribu || i < 0) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, i)}
      <span translate="no">{tribu}</span>
      {texto.slice(i + tribu.length)}
    </>
  );
}

type Props = {
  decision: Decision;
  fogon: FogonUsado;
  /** El holón enfocado y la lente: viajan en "Abrir la propuesta" para poder volver al mismo lugar. */
  desde: string;
  lente?: string;
  /** Línea extra bajo los chips: "en {círculo} · {tribu}" o "Se decide en {holón}". */
  lugar?: React.ReactNode;
};

/** Una decisión: voto, "Llevar al consejo", parámetros y "Abrir la propuesta". */
export function TarjetaDecision({ decision: d, fogon, desde, lente, lugar }: Props) {
  const idioma = useIdioma();
  const t = useTextos("fogon");
  const tp = useTextos("fogonPropuestas");
  const comunes = useTextos("comunes");
  const manifiestoVrn = useTextos("manifiestoVrn");
  const OPCIONES = opcionesDe(idioma);
  const { estado, condicion, listo, participacion, abierta, setAbierta, elegir, llevar } = fogon;

  // Hasta terminar de leer lo guardado (residencia) no se muestra ni el motivo ni el botón.
  const motivo = listo ? motivoSinVoto(d, condicion) : null;
  const propio = votoPropio(estado, d, condicion);
  const c = contar(d, propio);
  const idTitulo = `dec-${d.id}`;
  const titulo = textoEn(d.titulo, idioma);
  // La nota "Translated from Spanish" va debajo del título, fuera del encabezado, para no sumarla a su nombre.
  const traducido = idioma !== (d.titulo.original ?? "es") && d.titulo.en !== undefined && d.titulo.en.trim() !== "";
  const esRecomendacion = d.destino !== undefined;
  const etiquetaPropio = propio ? OPCIONES.find((o) => o.id === propio)!.etiqueta : "";

  const params = new URLSearchParams({ desde });
  if (lente) params.set("lente", lente);

  return (
    <li aria-labelledby={idTitulo} className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-2">
          <div>
            <h4 id={idTitulo} tabIndex={-1} className="font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
              <ConTribu texto={titulo} tribu={d.tribu} />
            </h4>
            {traducido && <p className="text-xs text-muted">{comunes.traducidoDelOriginal}</p>}
          </div>
          <p className="flex flex-wrap gap-2">
            <span className={CHIP}>
              {d.tribu ? <ConTribu texto={textoEn(d.donde, idioma)} tribu={d.tribu} /> : <TextoBilingue valor={d.donde} sinNota />}
            </span>
            <span className={`${CHIP} border-deep text-deep`}>
              <TextoBilingue valor={d.regla} sinNota />
              <TerminoLegal clave={d.base} />
            </span>
            {d.ambito === "tribu" && <span className={CHIP}>{t.chipTribu}</span>}
            {d.ambito === "circulo" && <span className={CHIP}>{t.chipCirculo}</span>}
            {d.pideAlComun && <span className={CHIP}>{t.pideAlComun}</span>}
          </p>
          {lugar && <p className="text-sm text-muted">{lugar}</p>}
          {d.destino && (
            <p className="text-sm font-medium">
              {t.destino[d.destino]}
              <TerminoLegal clave={d.base} />
            </p>
          )}
          {d.origen && (
            <p className="text-sm font-medium">
              {t.vieneDe} <span translate="no">{d.origen.aprobadaEn}</span> {t.aprobadaEnTribu}
              <TerminoLegal clave="consejo" />
            </p>
          )}
          <ParametrosDecision decision={d} />
        </div>
        <div className="grid justify-items-end gap-2 text-right">
          {listo && puedeLlevarAlConsejo(estado, d, condicion) && (
            <button type="button" onClick={() => llevar(d.id)} className={BOTON_SUAVE}>
              {t.llevarAlConsejo}
            </button>
          )}
          {listo && d.pideAlComun && estado.alConsejo.includes(d.id) && (
            <span className={`${CHIP} text-muted`}>{t.yaEnConsejo}</span>
          )}
          {!listo ? null : motivo ? (
            <span className={`${CHIP} text-muted`}>
              {motivo === "manifiesto" ? (
                <AvisoAdhesion texto={participacion.desactualizada ? manifiestoVrn.aviso.desactualizada : t.motivos.manifiesto} />
              ) : (
                t.motivos[motivo]
              )}
            </span>
          ) : (
            <button
              type="button"
              id={`abrir-${d.id}`}
              aria-expanded={abierta === d.id}
              aria-controls={`votar-${d.id}`}
              onClick={() => setAbierta(abierta === d.id ? null : d.id)}
              className={BOTON_SUAVE}
            >
              {esRecomendacion ? (propio ? t.cambiarRecomendacion : t.recomendar) : propio ? t.cambiarVoto : t.votar}
            </button>
          )}
        </div>
      </div>

      {abierta === d.id && !motivo && (
        <div
          id={`votar-${d.id}`}
          role="group"
          aria-label={esRecomendacion ? t.recomendacionAria(titulo) : t.votoAria(titulo)}
          className="flex flex-wrap gap-2"
        >
          {OPCIONES.map((o) => (
            <button key={o.id} type="button" onClick={() => elegir(d.id, o.id)} className={BOTON_SUAVE}>
              {o.etiqueta}
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-muted">
        {esRecomendacion ? t.recomendacionesDeEjemplo : t.votosDeEjemplo} {OPCIONES.map((o) => `${o.etiqueta} ${c[o.id]}`).join(" · ")}
      </p>
      {d.ambito === "consejo" && <p className="text-sm text-muted">{t.votanRepresentantes}</p>}
      {propuestaDe(d.id) && (
        <p>
          <Link className={`${BOTON_SUAVE} inline-block`} href={`/fogon/propuestas/${d.id}?${params.toString()}`}>
            {tp.pagina.abrir}
          </Link>
        </p>
      )}
      {listo && propio && (
        <p className="rounded-lg border border-deep bg-green-soft px-3 py-2 text-sm text-deep">
          <span aria-hidden="true">✓ </span>
          {esRecomendacion ? t.tuRecomendacion(etiquetaPropio) : t.tuVoto(etiquetaPropio)}
          <span className="block">
            <ConTribu texto={t.acta(etiquetaPropio.toLowerCase(), titulo)} tribu={d.tribu} />
          </span>
        </p>
      )}
    </li>
  );
}
