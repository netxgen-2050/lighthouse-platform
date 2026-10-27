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
import { textoEn } from "@/lib/idioma/tipos";
import type { ManifiestoBilingue } from "@/lib/manifiestos/datos";
import { COMUNIDAD_LIGHTHOUSE } from "@/lib/membresia/estado";
import { useMembresia } from "@/lib/membresia/usar-membresia";

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2 disabled:cursor-not-allowed disabled:opacity-60`;
const SUAVE = `${BOTON} border border-muted hover:bg-surface-2`;

const HUELGA = 8; // píxeles de tolerancia para dar por llegado al final

export function LecturaManifiesto({ manifiesto: m, pactos }: { manifiesto: ManifiestoBilingue; pactos: boolean }) {
  const idioma = useIdioma();
  const tx = useTextos("tribus");
  const t = tx.manifiesto;
  const tm = tx.membresia;
  const comunes = useTextos("comunes");
  const { estado: estadoSesion, nivel, nivelListo } = useSesion();
  const conSesion = estadoSesion === "ok";
  // Adherir es de Miembro en adelante; Explorador y sin cuenta ven "Sumate para adherir".
  const puedeAdherir = conSesion && puedeCapacidad(nivel, "adherir");
  const { estado, cargado, falloAlmacen, adherir, aceptar } = useMembresia(m.id, conSesion);
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
  const textoGuardado = !cargado || mensaje ? "" : estado === "pedido" ? textoPedido : estado === "miembro" ? textoMiembro : "";

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
        <TerminoLegal clave="adhesion" />
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
        <p>
          <TextoBilingue valor={m.introduccion} sinNota />
        </p>
        <ol className="grid gap-3">
          {m.compromisos.map((c, i) => (
            <li key={c.titulo.es} className="grid gap-1">
              <h2 className="font-semibold">
                {i + 1}. <TextoBilingue valor={c.titulo} sinNota />
              </h2>
              <p>
                <TextoBilingue valor={c.texto} sinNota />
              </p>
            </li>
          ))}
        </ol>
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
      ) : !cargado ? null : estado === "no-miembro" ? (
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
        <div className="mt-4 grid gap-3 rounded-xl border border-faint bg-surface-2 p-4">
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
        </div>
      ) : (
        <div className="mt-4 grid gap-3 rounded-xl border border-faint bg-surface-2 p-4">
          <div className="flex flex-wrap gap-3">
            {pactos && (
              <Link className={PRIMARIO} href={`/pactos?comunidad=${m.id}`}>
                {tm.proponerPacto}
              </Link>
            )}
            <Link className={SUAVE} href={esLighthouse ? "/territorios/lighthouse" : `/tribus/${m.id}`}>
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
