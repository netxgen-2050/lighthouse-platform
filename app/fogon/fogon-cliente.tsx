"use client";

import { useEffect, useState } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import Link from "next/link";
import { CLAVES } from "@/lib/demo/claves";
import { ParametrosDecision } from "./parametros-decision";
import { TextoBilingue } from "@/components/texto-bilingue";
import { ambitos as ambitosDe, opciones as opcionesDe, type Ambito, type Opcion } from "@/lib/fogon/datos";
import {
  contar,
  decisionesVisibles,
  filtrar,
  INICIAL,
  leer,
  llevarAlConsejo,
  motivoSinVoto,
  puedeLlevarAlConsejo,
  SIN_CONDICION,
  votar,
  votoPropio,
  type Condicion,
  type EstadoFogon,
} from "@/lib/fogon/estado";
import { agregar, guardarRegistros, leerRegistrosDelNavegador } from "@/lib/gobernanza/registros";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { textoEn } from "@/lib/idioma/tipos";
import { personaDesdeSumarte } from "@/lib/canales/puertas";
import { puede } from "@/lib/permisos/calcular";
import { leerPasaporteDelNavegador } from "@/lib/pasaporte/del-navegador";
import { leerEstadoGuardado } from "@/lib/sesion/nivel";

// Todo queda solo en este navegador: no hay pedidos de red.

const BOTON =
  "rounded-lg border px-4 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON_SUAVE = `${BOTON} border-muted hover:bg-surface-2`;
const BOTON_ACTIVO = `${BOTON} border-deep bg-deep text-on-deep`;
const CHIP = "rounded-full border border-faint px-3 py-0.5 text-sm";

/** El texto con el nombre de la tribu (si lo trae) marcado `translate="no"`: los nombres propios no se traducen. */
function ConTribu({ texto, tribu }: { texto: string; tribu?: string }) {
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

export function FogonCliente() {
  const idioma = useIdioma();
  const t = useTextos("fogon");
  const comunes = useTextos("comunes");
  const AMBITOS = ambitosDe(idioma);
  const OPCIONES = opcionesDe(idioma);
  const [estado, setEstado] = useState<EstadoFogon>(INICIAL);
  const [ambito, setAmbito] = useState<Ambito | null>(null);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const [listo, setListo] = useState(false);
  const [anuncio, setAnuncio] = useState("");
  const [condicion, setCondicion] = useState<Condicion>(SIN_CONDICION);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      // Si el navegador bloquea el almacenamiento, ni siquiera existe `window.localStorage`: queda sin Pase.
      const sumarte = leerEstadoGuardado(window.localStorage);
      const pase = puede(personaDesdeSumarte(sumarte), "voto-fideicomiso").abierta;
      // La tribu que lidera sale de lo elegido en Sumarte (Plan Tribu); sin tribu elegida no lidera ninguna.
      const lidera = sumarte.tribu ? sumarte.tribuId : null;
      setCondicion({ residencia: leerPasaporteDelNavegador().residencia, pase, lidera });
      setEstado(leer(window.localStorage.getItem(CLAVES.fogon)));
    } catch {
      setFalloAlmacen(true);
    }
    setListo(true);
  }, []);

  function guardar(siguiente: EstadoFogon): boolean {
    try {
      window.localStorage.setItem(CLAVES.fogon, JSON.stringify(siguiente));
      setFalloAlmacen(false);
    } catch {
      setFalloAlmacen(true);
      return false;
    }
    setEstado(siguiente);
    return true;
  }

  function elegir(id: string, opcion: Opcion) {
    const d = decisionesVisibles(estado).find((x) => x.id === id);
    if (!d || !guardar(votar(estado, id, opcion, condicion))) return;
    setAbierta(null);
    // Se vacía primero y se escribe en el próximo tick: si el texto es igual al anterior (mismo voto
    // repetido), React no tocaría el DOM y el lector de pantalla no anunciaría nada.
    const texto = t.anuncioVoto(OPCIONES.find((o) => o.id === opcion)!.etiqueta, textoEn(d.titulo, idioma));
    setAnuncio("");
    setTimeout(() => setAnuncio(texto), 50);
    // El grupo de opciones se cierra: el foco vuelve al botón que lo abrió, en la misma decisión.
    document.getElementById(`abrir-${id}`)?.focus();
  }

  function llevar(id: string) {
    const siguiente = llevarAlConsejo(estado, id, condicion);
    const d = decisionesVisibles(estado).find((x) => x.id === id);
    if (siguiente === estado || !d?.tribuId || !guardar(siguiente)) return;
    // Registro con forma de attestation: la tribu afirma que llevó esta decisión. Solo en este navegador.
    guardarRegistros(
      agregar(leerRegistrosDelNavegador(), { esquema: "lleva-al-consejo", afirma: d.tribuId, sobre: id, datos: { titulo: d.titulo.es } }, new Date().toISOString()),
    );
    const texto = t.llevaste(textoEn(d.titulo, idioma));
    setAnuncio("");
    setTimeout(() => setAnuncio(texto), 50);
    // El botón desaparece: el foco pasa al título de la decisión.
    document.getElementById(`dec-${id}`)?.focus();
  }

  const lista = filtrar(ambito, estado);

  return (
    <div className="grid gap-5">
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium text-danger">
          {t.errorAlmacenamiento}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label={t.filtrarAria} className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={ambito === null} onClick={() => setAmbito(null)} className={ambito === null ? BOTON_ACTIVO : BOTON_SUAVE}>
            {ambito === null && <span aria-hidden="true">✓ </span>}{t.todas}
          </button>
          {AMBITOS.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={ambito === a.id}
              onClick={() => setAmbito(a.id)}
              className={ambito === a.id ? BOTON_ACTIVO : BOTON_SUAVE}
            >
              {ambito === a.id && <span aria-hidden="true">✓ </span>}
              {a.etiqueta}
            </button>
          ))}
        </div>
      </div>

      <ul className="grid gap-3">
        {lista.map((d) => {
          // Hasta terminar de leer lo guardado (residencia) no se muestra ni el motivo ni el botón.
          const motivo = listo ? motivoSinVoto(d, condicion) : null;
          const propio = votoPropio(estado, d, condicion);
          const c = contar(d, propio);
          const idTitulo = `dec-${d.id}`;
          const titulo = textoEn(d.titulo, idioma);
          // La nota "Translated from Spanish" va debajo del título, fuera del encabezado, para no sumarla a su nombre.
          const traducido = idioma !== (d.titulo.original ?? "es") && d.titulo.en !== undefined && d.titulo.en.trim() !== "";
          return (
            <li key={d.id} aria-labelledby={idTitulo} className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid gap-2">
                  <div>
                    <h2 id={idTitulo} tabIndex={-1} className="font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"><ConTribu texto={titulo} tribu={d.tribu} /></h2>
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
                      {t.motivos[motivo]}
                      {motivo === "pase" && (
                        <>
                          {" · "}
                          <Link className="underline" href="/sumarte">{t.verPase}</Link>
                        </>
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
                      {propio ? t.cambiarVoto : t.votar}
                    </button>
                  )}
                </div>
              </div>

              {abierta === d.id && !motivo && (
                <div id={`votar-${d.id}`} role="group" aria-label={t.votoAria(titulo)} className="flex flex-wrap gap-2">
                  {OPCIONES.map((o) => (
                    <button key={o.id} type="button" onClick={() => elegir(d.id, o.id)} className={BOTON_SUAVE}>
                      {o.etiqueta}
                    </button>
                  ))}
                </div>
              )}

              <p className="text-sm text-muted">
                {t.votosDeEjemplo} {OPCIONES.map((o) => `${o.etiqueta} ${c[o.id]}`).join(" · ")}
              </p>
              {d.ambito === "consejo" && (
                <p className="text-sm text-muted">{t.votanRepresentantes}</p>
              )}
              {listo && propio && (
                <p className="rounded-lg border border-deep bg-green-soft px-3 py-2 text-sm text-deep">
                  <span aria-hidden="true">✓ </span>
                  {t.tuVoto(OPCIONES.find((o) => o.id === propio)!.etiqueta)}
                  <span className="block"><ConTribu texto={t.acta(OPCIONES.find((o) => o.id === propio)!.etiqueta.toLowerCase(), titulo)} tribu={d.tribu} /></span>
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <p role="status" className="sr-only">
        {anuncio}
      </p>

      {listo && (
        <p className="text-sm text-muted">
          {condicion.pase ? t.pase.con : t.pase.sin}
        </p>
      )}
    </div>
  );
}
