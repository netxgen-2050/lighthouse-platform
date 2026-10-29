"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSesion } from "@/components/sesion/contexto";
import { EntrarPara } from "@/components/sesion/entrar-para";
import { puedeCapacidad } from "@/lib/permisos/niveles";
import { TerminoLegal } from "@/components/termino-legal";
import { registrarEvento } from "@/lib/actividad/almacen";
import { EVENTOS } from "@/lib/actividad/eventos";
import { TextoBilingue } from "@/components/texto-bilingue";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { textoEn, type Idioma } from "@/lib/idioma/tipos";
import type { ManifiestoBilingue } from "@/lib/manifiestos/datos";
import {
  GRUPOS_PRINCIPIO,
  principioVrnPorId,
  principiosDelGrupo,
  type ManifiestoVrn,
} from "@/lib/manifiestos/lighthouse-vrn";
import type { PrincipioDeTribu } from "@/lib/manifiestos/principios-tribu";
import { COMUNIDAD_LIGHTHOUSE } from "@/lib/membresia/estado";
import { useMembresia } from "@/lib/membresia/usar-membresia";

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2 disabled:cursor-not-allowed disabled:opacity-60`;
const SUAVE = `${BOTON} border border-muted hover:bg-surface-2`;

const HUELGA = 8; // píxeles de tolerancia para dar por llegado al final

/** Los principios por grupo y los derechos de la tierra, dentro del texto que hay que leer hasta el final. */
function SeccionesVrn({ vrn: m, idioma }: { vrn: ManifiestoVrn; idioma: Idioma }) {
  const tx = useTextos("manifiestoVrn");
  return (
    <>
      <h2 className="text-lg font-semibold">{tx.lectura.principios}</h2>
      {GRUPOS_PRINCIPIO.map((g) => (
        <section key={g} aria-labelledby={`lectura-grupo-${g}`} className="grid gap-2">
          <h3 id={`lectura-grupo-${g}`} className="font-semibold">
            {tx.grupos[g]}
          </h3>
          <ul className="grid gap-2">
            {principiosDelGrupo(g).map((p) => (
              <li key={p.id} className="grid gap-0.5">
                <span className="font-medium">
                  <TextoBilingue valor={p.nombre} sinNota />
                </span>
                <span className="text-sm">
                  <TextoBilingue valor={p.practica} sinNota />
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <h2 className="text-lg font-semibold">
        {tx.lectura.derechos}
        <TerminoLegal clave="derechostierra" idioma={idioma} />
      </h2>
      <p className="text-sm">{tx.ficha.derechosIntro}</p>
      <ul className="grid gap-2">
        {m.derechos.map((d) => (
          <li key={d.id} className="grid gap-0.5">
            <span className="font-medium">
              <TextoBilingue valor={d.nombre} sinNota />
            </span>
            <span className="text-sm">
              <TextoBilingue valor={d.practica} sinNota />
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Cómo se cambia el manifiesto, la regla de las tribus y la frase de cierre. Sin ningún botón para cambiarlo. */
function ComoSeCambiaVrn({ vrn: m }: { vrn: ManifiestoVrn }) {
  const tx = useTextos("manifiestoVrn");
  return (
    <>
      <h2 className="text-lg font-semibold">{tx.lectura.comoSeCambia}</h2>
      <ol className="grid list-decimal gap-1 pl-5">
        {m.comoSeCambia.map((x) => (
          <li key={x.es}>
            <TextoBilingue valor={x} sinNota />
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted">{tx.lectura.sinBoton}</p>
      <p>
        <Link className="underline" href="/fogon">
          {tx.lectura.irAlFogon}
        </Link>
      </p>
      <h2 className="text-lg font-semibold">{tx.lectura.reglaTribus}</h2>
      <p>
        <TextoBilingue valor={m.reglaTribus} sinNota />
      </p>
      <h2 className="text-lg font-semibold">{tx.lectura.maquinas}</h2>
      <p>
        <TextoBilingue valor={m.maquinasSugieren} sinNota />
      </p>
    </>
  );
}

/** Lo que una tribu suma a los principios de Lighthouse VRN, o que todavía no sumó nada. */
function PrincipiosPropios({ propios, idioma }: { propios: PrincipioDeTribu[]; idioma: Idioma }) {
  const tx = useTextos("manifiestoVrn").tribu;
  return (
    <section aria-labelledby="principios-propios" className="grid gap-2">
      <h2 id="principios-propios" className="text-lg font-semibold">
        {tx.suma}
      </h2>
      {propios.length === 0 ? (
        <p>{tx.sinPropios}</p>
      ) : (
        <ul className="grid gap-2">
          {propios.map((p) => (
            <li key={p.id} className="grid gap-0.5">
              <span className="font-medium">
                <TextoBilingue valor={p.nombre} sinNota />
              </span>
              <span>
                <TextoBilingue valor={p.practica} sinNota />
              </span>
              {p.profundiza.length > 0 && (
                <span className="text-sm text-muted">
                  {tx.profundiza}{" "}
                  {p.profundiza
                    .flatMap((id) => {
                      const x = principioVrnPorId(id);
                      return x ? [textoEn(x.nombre, idioma)] : [];
                    })
                    .join(", ")}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="text-sm text-muted">{tx.reglaCorta}</p>
      <p>
        <Link className="underline" href="/tribus/lighthouse/manifiesto">
          {tx.leerComun}
        </Link>
      </p>
    </section>
  );
}

export function LecturaManifiesto({ manifiesto: m, pactos }: { manifiesto: ManifiestoBilingue; pactos: boolean }) {
  const idioma = useIdioma();
  const tx = useTextos("tribus");
  const vrn = useTextos("manifiestoVrn");
  const t = tx.manifiesto;
  const tm = tx.membresia;
  const comunes = useTextos("comunes");
  const { estado: estadoSesion, nivel, nivelListo } = useSesion();
  const conSesion = estadoSesion === "ok";
  // Adherir es de Miembro en adelante; Explorador y sin cuenta ven "Sumate para adherir".
  const puedeAdherir = conSesion && puedeCapacidad(nivel, "adherir");
  const { estado, cargado, falloAlmacen, adherir, aceptar, desactualizada } = useMembresia(m.id, conSesion);
  const esLighthouse = m.id === COMUNIDAD_LIGHTHOUSE;
  const texto = useRef<HTMLDivElement>(null);
  const aviso = useRef<HTMLParagraphElement>(null);
  const moverFoco = useRef(false);
  const [llegoAlFinal, setLlegoAlFinal] = useState(false);
  const [leyo, setLeyo] = useState(false);
  const [cuidar, setCuidar] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const revisarFinal = useCallback(() => {
    const el = texto.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= HUELGA) setLlegoAlFinal(true);
  }, []);

  // Si el texto entra entero en pantalla, ya está "leído hasta el final".
  useEffect(() => {
    revisarFinal();
    window.addEventListener("resize", revisarFinal);
    return () => window.removeEventListener("resize", revisarFinal);
  }, [revisarFinal, cargado]);

  // Si el botón que tenía el foco desaparece (al adherir o al aceptar), el foco pasa a la zona de avisos.
  useEffect(() => {
    if (moverFoco.current) {
      moverFoco.current = false;
      aviso.current?.focus();
    }
  }, [estado]);

  const textoPedido = tm.pedidoLlego(esLighthouse, m.comunidad);
  const textoMiembro = tm.yaSosParte(esLighthouse, m.comunidad);
  // El estado guardado se muestra como texto común; la zona de avisos solo se llena por una acción de esta sesión.
  const textoGuardado =
    !cargado || mensaje || desactualizada ? "" : estado === "pedido" ? textoPedido : estado === "miembro" ? textoMiembro : "";

  const puede = llegoAlFinal && leyo && cuidar;
  const faltan: string[] = [];
  if (!llegoAlFinal) faltan.push(t.faltaFinal);
  if (!leyo || !cuidar) faltan.push(t.faltaCasillas);

  // El texto del manifiesto es la voz de la comunidad: en otro idioma que el original lleva una nota visible, una sola
  // para todo el texto (cada pieza se muestra sin nota propia).
  const traducido = (m.introduccion.original ?? "es") !== idioma;

  return (
    <>
      <h1 className="mt-4 text-3xl font-semibold">
        <TextoBilingue valor={m.titulo} sinNota />
      </h1>
      <p className="mt-1 text-sm text-muted">
        {t.versionDel(textoEn(m.version, idioma))}{" "}
        <span className="rounded-full border border-faint px-2 py-0.5 text-xs">{tx.ejemplo}</span>
        {m.vrn && <span className="ml-1 rounded-full border border-faint px-2 py-0.5 text-xs">{vrn.borrador}</span>}
        <TerminoLegal clave={m.vrn ? "manifiestovrn" : "adhesion"} idioma={idioma} />
      </p>
      {traducido && <p className="mt-1 text-sm font-medium text-muted">{comunes.traducidoDelOriginal}</p>}

      <div
        ref={texto}
        onScroll={revisarFinal}
        role="region"
        aria-label={t.textoDelManifiesto}
        tabIndex={0}
        className="mt-4 grid max-h-[28rem] gap-4 overflow-y-auto rounded-xl border border-faint bg-surface p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
      >
        {m.vrn && <h2 className="text-lg font-semibold">{vrn.ficha.proposito}</h2>}
        <p>
          <TextoBilingue valor={m.introduccion} sinNota />
        </p>
        {m.vrn && <SeccionesVrn vrn={m.vrn} idioma={idioma} />}
        {m.vrn && <h2 className="text-lg font-semibold">{vrn.lectura.compromisos}</h2>}
        <ol className="grid gap-3">
          {m.compromisos.map((c, i) => (
            <li key={c.titulo.es} className="grid gap-1">
              {m.vrn ? (
                <h3 className="font-semibold">
                  {i + 1}. <TextoBilingue valor={c.titulo} sinNota />
                </h3>
              ) : (
                <h2 className="font-semibold">
                  {i + 1}. <TextoBilingue valor={c.titulo} sinNota />
                </h2>
              )}
              <p>
                <TextoBilingue valor={c.texto} sinNota />
              </p>
            </li>
          ))}
        </ol>
        {m.vrn && <ComoSeCambiaVrn vrn={m.vrn} />}
        {!m.vrn && <PrincipiosPropios propios={m.principiosPropios ?? []} idioma={idioma} />}
        <p className="text-sm text-muted">{t.fin}</p>
      </div>

      {/* Zona de avisos siempre presente: los lectores de pantalla leen lo que se escribe en ella y recibe el foco
          cuando el botón que lo tenía desaparece. */}
      <p
        ref={aviso}
        tabIndex={-1}
        role="status"
        className={`font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep ${mensaje ? "mt-4" : ""}`}
      >
        {mensaje}
      </p>
      {textoGuardado && <p className="mt-4 font-medium">{textoGuardado}</p>}

      {!puedeAdherir ? (
        estadoSesion === "cargando" || (conSesion && !nivelListo) ? null : (
          <div className="mt-4 grid gap-3 rounded-xl border border-faint bg-surface-2 p-4">
            <p className="text-sm">{tm.puedesLeer}</p>
            <EntrarPara texto={tm.sumateAdherir} nivelMinimo="miembro" />
          </div>
        )
      ) : !cargado ? null : estado === "no-miembro" || desactualizada ? (
        <form
          className="mt-4 grid gap-3 rounded-xl border border-faint bg-surface-2 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (puede) {
              moverFoco.current = true;
              setMensaje(textoPedido);
              adherir();
              registrarEvento(EVENTOS.adheriste(m.comunidad, m.id));
            }
          }}
        >
          <h2 className="text-lg font-semibold">{t.antesDeAdherir}</h2>
          {desactualizada && <p className="text-sm font-medium">{vrn.lectura.cambioVersion}</p>}
          <p className="text-sm">{t.sumarteA(esLighthouse, m.comunidad)}</p>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1 size-4" checked={leyo} onChange={(e) => setLeyo(e.target.checked)} />
            <span>{t.leiAtentamente}</span>
          </label>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1 size-4" checked={cuidar} onChange={(e) => setCuidar(e.target.checked)} />
            <span>{t.mePrometo}</span>
          </label>
          <span className="inline-flex items-center">
            <button type="submit" className={PRIMARIO} disabled={!puede} aria-describedby="adherir-ayuda">
              {t.adherir}
            </button>
            <TerminoLegal clave="adhesion" />
          </span>
          <p id="adherir-ayuda" className="text-sm text-muted">
            {puede ? t.ayudaPuede : t.ayudaFalta(faltan.join(t.y))}
          </p>
        </form>
      ) : estado === "pedido" ? (
        <div className="mt-4 flex flex-wrap gap-3 rounded-xl border border-faint bg-surface-2 p-4">
          <button
            type="button"
            className={PRIMARIO}
            onClick={() => {
              moverFoco.current = true;
              setMensaje(textoMiembro);
              aceptar();
              registrarEvento(EVENTOS.adhesionAceptada(m.comunidad, m.id));
            }}
          >
            {tm.simularAcepta}
          </button>
          <Link className={SUAVE} href={`/tribus/${m.id}`}>
            {t.volver}
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 rounded-xl border border-faint bg-surface-2 p-4">
          <div className="flex flex-wrap gap-3">
            {pactos && (
              <Link className={PRIMARIO} href={`/pactos?comunidad=${m.id}`}>
                {tm.proponerPacto}
              </Link>
            )}
            <Link className={SUAVE} href={`/tribus/${m.id}`}>
              {t.volver}
            </Link>
          </div>
        </div>
      )}
      {falloAlmacen && (
        <p role="alert" className="mt-2 text-sm font-medium">
          {tm.falloAlmacen}
        </p>
      )}
    </>
  );
}
